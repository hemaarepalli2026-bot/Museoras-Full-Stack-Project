import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const artworksApi = createApi({
  reducerPath: "artworksApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/",
  }),
  endpoints: (builder) => ({
    getArtworks: builder.query({
      query: () => "api/artworks",
    }),
  }),
});

export const { useGetArtworksQuery } = artworksApi;
