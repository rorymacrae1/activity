import { act } from "react";
import { useFavoritesStore } from "@/stores/favorites";

beforeEach(() => {
  act(() => useFavoritesStore.setState({ favoriteIds: [] }));
});

describe("useFavoritesStore", () => {
  it("starts with no favorites", () => {
    expect(useFavoritesStore.getState().favoriteIds).toHaveLength(0);
  });

  it("addFavorite adds a resort id", () => {
    act(() => useFavoritesStore.getState().addFavorite("val-thorens"));
    expect(useFavoritesStore.getState().favoriteIds).toContain("val-thorens");
  });

  it("addFavorite is idempotent — no duplicates", () => {
    act(() => {
      useFavoritesStore.getState().addFavorite("val-thorens");
      useFavoritesStore.getState().addFavorite("val-thorens");
    });
    const ids = useFavoritesStore.getState().favoriteIds;
    expect(ids.filter((id) => id === "val-thorens")).toHaveLength(1);
  });

  it("removeFavorite removes a resort id", () => {
    act(() => {
      useFavoritesStore.getState().addFavorite("val-thorens");
      useFavoritesStore.getState().removeFavorite("val-thorens");
    });
    expect(useFavoritesStore.getState().favoriteIds).not.toContain("val-thorens");
  });

  it("removeFavorite is a no-op for non-existent id", () => {
    act(() => useFavoritesStore.getState().removeFavorite("nonexistent"));
    expect(useFavoritesStore.getState().favoriteIds).toHaveLength(0);
  });

  it("isFavorite returns true for saved resort", () => {
    act(() => useFavoritesStore.getState().addFavorite("zermatt"));
    expect(useFavoritesStore.getState().isFavorite("zermatt")).toBe(true);
  });

  it("isFavorite returns false for unsaved resort", () => {
    expect(useFavoritesStore.getState().isFavorite("zermatt")).toBe(false);
  });

  it("clearAll removes all favorites", () => {
    act(() => {
      useFavoritesStore.getState().addFavorite("val-thorens");
      useFavoritesStore.getState().addFavorite("zermatt");
      useFavoritesStore.getState().clearAll();
    });
    expect(useFavoritesStore.getState().favoriteIds).toHaveLength(0);
  });
});
