export const routeDebug = [
  {
    path: "/debug",
    async lazy() {
      const { default: DebugView } = await import("@/views/debug/DebugView");
      return { Component: DebugView };
    },
  },
  /*{
    path: "/debug/dbtool",
    async lazy() {
      const { default: DebugDatabaseView } = await import(
        "@/views/debug/DebugDatabaseView"
      );
      return { Component: DebugDatabaseView };
    },
    },*/
];
