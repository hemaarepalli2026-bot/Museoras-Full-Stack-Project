import { configureStore } from "@reduxjs/toolkit";
import { artworksApi } from "../features/artworks/artworksApi";

export const store = configureStore({
  reducer: {
    [artworksApi.reducerPath]: artworksApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(artworksApi.middleware),
});
