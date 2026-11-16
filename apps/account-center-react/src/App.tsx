import { BrowserRouter, Route, Routes } from 'react-router';
import { AppShell } from '@/components/AppShell';
import { RequireSession } from '@/components/RequireSession';
import { UserProvider } from '@/lib/user';
import { Account } from '@/pages/Account';
import { Activate } from '@/pages/Activate';
import { CheckEmail } from '@/pages/CheckEmail';
import { Home } from '@/pages/Home';
import { SignIn } from '@/pages/SignIn';
import { SignUp } from '@/pages/SignUp';
import { Verify } from '@/pages/Verify';

export function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/activate" element={<Activate />} />
          <Route
            element={
              <RequireSession>
                <AppShell />
              </RequireSession>
            }
          >
            <Route index element={<Home />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
