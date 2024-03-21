import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";





export const loader = async ({ request }) => {



};

export default function App() {
  

  return (
   <>
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>

      </ui-nav-menu>
      <Outlet />
      </>

  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
