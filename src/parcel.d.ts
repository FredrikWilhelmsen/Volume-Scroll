// Parcel's "url:" scheme imports return the asset URL as a string at runtime.
// This declaration tells TypeScript to treat them as strings.
declare module "url:*" {
    const url: string;
    export default url;
}
