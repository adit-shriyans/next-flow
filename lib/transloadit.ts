export function getTransloaditParams() {
  return {
    auth: {
      key: process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY ?? "",
    },
    steps: {
      upload: {
        robot: "/upload/handle",
      },
      store: {
        robot: "/s3/store",
        use: "upload",
      },
    },
  };
}
