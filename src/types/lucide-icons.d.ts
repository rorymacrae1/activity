/**
 * Type declarations for lucide-react-native deep icon imports.
 *
 * Deep imports bypass the barrel export, preventing Metro from bundling
 * all 1,700+ icons when only ~40 are used. Each CJS icon file exports
 * a single LucideIcon component as its default export.
 */
declare module "lucide-react-native/dist/cjs/icons/*" {
  import type { LucideIcon } from "lucide-react-native";
  const icon: LucideIcon;
  export default icon;
}
