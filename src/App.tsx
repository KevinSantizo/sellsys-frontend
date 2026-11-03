import { AuthInitializer } from "./modules/auth/components/AuthInitializer";
import { AppRoutes } from "./routes/AppRoutes";
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <AuthInitializer>
      <AppRoutes />
      <Analytics />
    </AuthInitializer>
  );
}

export default App;