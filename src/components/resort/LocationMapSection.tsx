/**
 * LocationMapSection — WEB platform
 *
 * Uses an <iframe> with a data-URI so the same Leaflet HTML renders in the
 * browser without react-native-webview. Metro resolves this file on web
 * automatically because it lacks the .native extension.
 *
 * Colours are locked to theme hex values so they render correctly inside
 * the iframe HTML without needing to import theme modules at runtime.
 */

import { useState, useEffect, useRef } from "react";
import { View, Modal, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, spacing, radius } from "@/theme";
import type { Resort } from "@/types/resort";

// ─── Web iframe wrapper ───────────────────────────────────────────────────────

/**
 * Renders Leaflet HTML inside a sandboxed iframe.
 * react-native-web passes <iframe> straight through to the DOM.
 */
function IframeMap({ html }: { html: string }) {
  const blobUrlRef = useRef<string | null>(null);
  const [src, setSrc] = useState("");

  useEffect(() => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    setSrc(url);
    return () => {
      URL.revokeObjectURL(url);
      blobUrlRef.current = null;
    };
  }, [html]);

  if (!src) return null;
  return <iframe src={src} style={iframeStyle} title="Resort map" />;
}

const iframeStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  border: "none",
  display: "block",
};

// ─── Map pin hex values (mirrored from src/theme/colors.ts) ─────────────────
const PIN_RESORT = "#4A90A4"; // colors.brand.primary / ice[500]
const PIN_ACCOM = "#F59E0B"; // colors.sentiment.warning / amber[500]
const PIN_SKI = "#EF4444"; // colors.sentiment.error / signal[500]

const PREVIEW_HEIGHT = 210;

// ─── HTML builder ────────────────────────────────────────────────────────────

/**
 * Build the Leaflet HTML string for a given resort location.
 *
 * @param lat         Resort village latitude
 * @param lng         Resort village longitude
 * @param name        Resort name (sanitised before insertion)
 * @param interactive When false, dragging / zoom gestures are disabled.
 */
function buildMapHtml(
  lat: number,
  lng: number,
  name: string,
  interactive: boolean,
): string {
  // Prevent XSS — resort names must never contain raw HTML
  const safeName = name.replace(
    /[<>"'&]/g,
    (c) =>
      ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;" })[
        c
      ] ?? c,
  );

  const drag = interactive ? "true" : "false";
  const zoom = interactive ? 15 : 14;

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body,#map{width:100%;height:100%}
  .pr{width:14px;height:14px;border-radius:50%;background:${PIN_RESORT};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)}
  .pa{width:11px;height:11px;border-radius:50%;background:${PIN_ACCOM};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)}
  .ps{width:11px;height:11px;border-radius:50%;background:${PIN_SKI};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)}
  .leaflet-popup-content-wrapper{border-radius:8px;font-size:12px;line-height:1.5;font-family:sans-serif}
  .leaflet-popup-content{margin:8px 10px}
  .leaflet-control-attribution{font-size:9px}
</style>
</head><body><div id="map"></div><script>
var LAT=${lat},LNG=${lng};
var map=L.map('map',{dragging:${drag},scrollWheelZoom:false,touchZoom:${drag},doubleClickZoom:${drag},zoomControl:${interactive}}).setView([LAT,LNG],${zoom});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'\\u00a9 OpenStreetMap'}).addTo(map);

function mkIcon(cls){return L.divIcon({className:'',html:'<div class="'+cls+'"></div>',iconSize:[14,14],iconAnchor:[7,7],popupAnchor:[0,-9]});}

// Resort-centre pin
L.marker([LAT,LNG],{icon:mkIcon('pr'),title:'${safeName}'}).addTo(map).bindPopup('<strong>${safeName}</strong><br/>Resort village');

// Load nearby POIs from Overpass API (online only — fails silently)
var q='[out:json][timeout:10];('
  +'node["tourism"~"hotel|hostel|chalet|guest_house|apartment"](around:1500,'+LAT+','+LNG+');'
  +'way["tourism"~"hotel|hostel|chalet|guest_house"](around:1500,'+LAT+','+LNG+');'
  +'node["shop"="ski"](around:1500,'+LAT+','+LNG+');'
  +'node["amenity"="ski_rental"](around:1500,'+LAT+','+LNG+');'
  +'node["shop"="outdoor"]["sport"="skiing"](around:1500,'+LAT+','+LNG+');'
  +');out center;';

fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:new URLSearchParams({data:q})})
  .then(function(r){return r.json();})
  .then(function(d){
    (d.elements||[]).forEach(function(el){
      var n=(el.tags&&(el.tags.name||el.tags.operator||el.tags.brand))||'';
      if(!n)return;
      var lt=el.lat||(el.center&&el.center.lat);
      var ln=el.lon||(el.center&&el.center.lon);
      if(!lt||!ln)return;
      var isAccom=!!(el.tags&&el.tags.tourism);
      var cls=isAccom?'pa':'ps';
      var cat=isAccom?'Accommodation':'Ski shop / rental';
      L.marker([lt,ln],{icon:mkIcon(cls)}).addTo(map).bindPopup('<strong>'+n+'</strong><br/>'+cat);
    });
  })
  .catch(function(){});
</script></body></html>`;
}

// ─── Component ────────────────────────────────────────────────

interface LocationMapSectionProps {
  /** The resort whose location and nearby POIs should be shown. */
  resort: Resort;
}

/**
 * Embeds an OpenStreetMap preview on the resort detail page (web platform).
 * Tapping “Explore Map” opens a full-screen interactive version.
 */
export function LocationMapSection({ resort }: LocationMapSectionProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const { lat, lng } = resort.location;
  const previewHtml = buildMapHtml(lat, lng, resort.name, false);
  const fullHtml = buildMapHtml(lat, lng, resort.name, true);

  return (
    <View style={styles.section}>
      {/* Header */}
      <Text variant="h3" style={styles.title}>
        Location & Nearby
      </Text>
      <Text
        variant="bodySmall"
        color={colors.ink.muted}
        style={styles.subtitle}
      >
        Accommodations, ski shops & rentals within 1.5 km
      </Text>

      {/* Static preview map */}
      <View style={styles.previewContainer}>
        <IframeMap html={previewHtml} />

        {/* Overlay that intercepts taps to open the modal */}
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open full-screen map"
        >
          <View style={styles.overlayBadge}>
            <Text
              variant="caption"
              color={colors.canvas.default}
              style={styles.overlayBadgeText}
            >
              📍 Explore Map
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendDot color={PIN_RESORT} label="Resort" />
        <LegendDot color={PIN_ACCOM} label="Accommodation" />
        <LegendDot color={PIN_SKI} label="Ski shop / rental" />
      </View>

      {/* Full-screen interactive map modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text variant="h3" style={styles.modalTitle} numberOfLines={1}>
              {resort.name}
            </Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close map"
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          {/* Map */}
          <View style={styles.fullMap}>
            <IframeMap html={fullHtml} />
          </View>

          {/* Modal legend */}
          <View style={styles.modalLegend}>
            <LegendDot color={PIN_RESORT} label="Resort" />
            <LegendDot color={PIN_ACCOM} label="Accommodation" />
            <LegendDot color={PIN_SKI} label="Ski shop / rental" />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ─── Legend helper ────────────────────────────────────────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text variant="caption" color={colors.ink.muted}>
        {label}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },

  // Preview
  previewContainer: {
    height: PREVIEW_HEIGHT,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.canvas.subtle,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: spacing.sm,
  },
  overlayBadge: {
    backgroundColor: colors.surface.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  overlayBadgeText: {
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Legend
  legend: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.canvas.default,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.divider,
  },
  modalTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 14,
    color: colors.ink.normal,
    fontWeight: "600",
  },
  fullMap: {
    flex: 1,
  },
  modalLegend: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surface.divider,
    backgroundColor: colors.canvas.default,
  },
});
