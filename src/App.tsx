import {
  AuthInitializer,
} from "./modules/auth/components/AuthInitializer";

import {
  AppRoutes,
} from "./routes/AppRoutes";

function App() {
  return (
    <AuthInitializer>
      <AppRoutes />
    </AuthInitializer>
  );
}

export default App;