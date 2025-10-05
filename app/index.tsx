import { router } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    // Redirect to splash screen immediately
    router.replace("/splash");
  }, []);

  return null;
}
