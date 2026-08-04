import { Link } from "react-router-dom";
import { RouteFacts } from "@/lib/transferRoutes";

// The route pages, as a grid of links with the fare on each one.
//
// It carries the price deliberately. A list of ten place names is a navigation menu; a
// list of ten prices is the thing the reader came to the site for, and it makes the link
// worth following rather than worth scrolling past.

export function RouteLinks({ routes, columns = 3 }: { routes: RouteFacts[]; columns?: 2 | 3 }) {
  return (
    <ul className={`grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {routes.map((route) => (
        <li key={route.path}>
          <Link
            to={route.path}
            className="block rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/50"
          >
            <span className="font-medium text-primary">{route.label}</span>
            <span className="block text-muted-foreground tabular-nums">
              €{route.oneWay} · {route.duration}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
