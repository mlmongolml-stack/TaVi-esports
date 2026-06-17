import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import RegisterTeam from "./pages/RegisterTeam";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import TeamProfile from "./pages/TeamProfile";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/tournaments" component={Tournaments} />
          <Route path="/tournaments/:slug" component={TournamentDetail} />
          <Route path="/news" component={News} />
          <Route path="/news/:slug" component={NewsArticle} />
          <Route path="/register-team" component={RegisterTeam} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/teams/:id" component={TeamProfile} />
          <Route path="/admin" component={Admin} />
          <Route path="/login" component={Login} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
