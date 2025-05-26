import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://dminhvu.com",
      lastModified: new Date(),
    },
    {
      url: "https://dminhvu.com/questions",
      lastModified: new Date(),
    },
    {
      url: "https://dminhvu.com/policy",
      lastModified: new Date(),
    },
    {
      url: "https://dminhvu.com/terms",
      lastModified: new Date(),
    },
  ];
}
