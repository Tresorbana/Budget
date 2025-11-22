import translations from "./translations";
import { useAuth } from "@/context/auth-context";

export function useTranslation() {
  const { preferences } = useAuth();
  const lang = preferences?.language || "en";

  const t = (key: string) => {
    return (translations as any)[lang]?.[key] || (translations as any)["en"]?.[key] || key;
  };

  return { t, lang };
}
