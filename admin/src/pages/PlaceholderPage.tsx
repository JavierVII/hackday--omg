import { Construction } from "lucide-react";
import { Card } from "../components/ui";
export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return <div className="page"><section className="hero-heading"><p>杭州西湖景区</p><h1>{title}</h1></section><Card className="placeholder-card"><Construction/><strong>基础框架已就绪</strong><p>{description}</p></Card></div>;
}
