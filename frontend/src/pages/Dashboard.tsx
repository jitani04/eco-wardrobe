import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Award, Settings, LogOut, ShoppingBag, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ first_name: string | null; last_name: string | null; } | null>(null);
  const [recommendedBrands, setRecommendedBrands] = useState<Array<{
    brand_name: string;
    brand_url: string | null;
    overall_score: number | null;
    price_tier?: string | null;
  }>>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  type ClothingItem = {
    clothing_id?: number;
    image_url?: string | null;
    product_url?: string | null;
    item_url?: string | null;
    brand_name?: string | null;
    brand?: string | null;
    item_name?: string | null;
    name?: string | null;
    garment_type?: string | null;
    color?: string | null;
    sustainability_score?: number | null;
    price?: number | null;
  };
  const [recommendedItems, setRecommendedItems] = useState<ClothingItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;

      setIsLoadingRecommendations(true);
      const { data, error } = await supabase
        .from("brands")
        .select("brand_name, brand_url, overall_score, price_tier")
        .gte("overall_score", 60)
        .order("overall_score", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Failed to fetch recommended brands", error);
        toast({
          title: "Could not load recommendations",
          description: "Please try again shortly.",
          variant: "destructive",
        });
      } else {
        setRecommendedBrands(data || []);
      }

      setIsLoadingRecommendations(false);
    };

    fetchRecommendations();
  }, [user, toast]);

  useEffect(() => {
    const fetchRecommendedItems = async () => {
      if (!user) return;

      setIsLoadingItems(true);
      const { data, error } = await supabase
        .from("clothing_items")
        .select("*")
        .limit(24);

      if (error) {
        console.error("Failed to fetch clothing items", error);
        toast({
          title: "Could not load items",
          description: "Please try again shortly.",
          variant: "destructive",
        });
        setIsLoadingItems(false);
        return;
      }

      const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
      setRecommendedItems(shuffled.slice(0, 4));
      setIsLoadingItems(false);
    };

    fetchRecommendedItems();
  }, [user, toast]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);



  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "Come back soon!",
    });
    navigate("/");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/favicon-96x96.png"
              alt="EcoStyle logo"
              className="w-9 h-9 rounded-lg border border-primary/20 shadow-sm"
            />
            <span className="font-semibold text-lg text-foreground tracking-tight">EcoStyle</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back{profile?.first_name ? `, ${profile.first_name} ${profile.last_name ?? ""}` : ""}!
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eco Score</p>
                <p className="text-2xl font-bold text-foreground">85/100</p>
              </div>
            </div>
            <Progress value={85} className="h-2" />
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sustainable Choices</p>
                <p className="text-2xl font-bold text-foreground">23</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                <p className="text-2xl font-bold text-foreground">12.4kg</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recommended Brands</h2>
              <p className="text-sm text-muted-foreground">Top sustainable picks from our database</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
              Updated
            </Badge>
          </div>

          {isLoadingRecommendations ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-lg border bg-muted/30 animate-pulse h-28" />
              ))}
            </div>
          ) : recommendedBrands.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recommendations yet. Check back soon!</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {recommendedBrands.map((brand, index) => {
                const score = brand.overall_score ? Math.round(brand.overall_score) : 0;
                const displayTier = brand.price_tier ? brand.price_tier.charAt(0).toUpperCase() + brand.price_tier.slice(1) : null;
                let hostname = brand.brand_url;
                try {
                  hostname = brand.brand_url ? new URL(brand.brand_url).hostname.replace(/^www\./, "") : null;
                } catch {
                  hostname = brand.brand_url;
                }

                return (
                  <div key={`${brand.brand_name}-${index}`} className="p-4 rounded-lg border bg-card hover:border-primary/40 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{brand.brand_name}</h3>
                          {displayTier ? (
                            <Badge variant="outline" className="text-xs border-primary/30">
                              {displayTier}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {hostname || "Sustainable favorite"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-xl font-bold text-foreground">{score}%</p>
                      </div>
                    </div>
                    <Progress value={score} className="h-2 mt-3" />
                    {brand.brand_url ? (
                      <a
                        href={brand.brand_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary mt-3 hover:underline"
                      >
                        Visit brand
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recommended Items</h2>
              <p className="text-sm text-muted-foreground">A few sustainable pieces to explore</p>
            </div>
            <Badge variant="outline" className="border-primary/30 text-xs">
              Fresh picks
            </Badge>
          </div>

          {isLoadingItems ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-lg border bg-muted/30 animate-pulse h-40" />
              ))}
            </div>
          ) : recommendedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet. Check back soon!</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recommendedItems.map((item, index) => {
                const title =
                  item.item_name ||
                  item.name ||
                  item.garment_type ||
                  "Sustainable piece";
                const brand = item.brand_name || item.brand || "Eco brand";
                const infoLine = [item.color, item.garment_type].filter(Boolean).join(" • ");
                const score =
                  typeof item.sustainability_score === "number"
                    ? Math.round(item.sustainability_score)
                    : null;
                const productUrl = item.product_url || item.item_url || item.image_url;
                const priceLabel =
                  typeof item.price === "number" ? `$${item.price.toFixed(2)}` : null;

                return (
                  <div
                    key={item.clothing_id ?? `${title}-${index}`}
                    className="p-4 rounded-lg border bg-card hover:border-primary/40 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex gap-3">
                      <div className="w-24 h-24 rounded-md overflow-hidden border bg-muted/40 flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm leading-tight">
                            {title}
                          </h3>
                          {score !== null ? (
                            <Badge variant="secondary" className="text-[10px] px-2 py-1">
                              {score}%
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">{brand}</p>
                        {infoLine ? (
                          <p className="text-[11px] text-muted-foreground">{infoLine}</p>
                        ) : null}
                        {priceLabel ? (
                          <p className="text-xs text-foreground font-medium">{priceLabel}</p>
                        ) : null}
                        {productUrl ? (
                          <a
                            href={productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            View item
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Viewed sustainable alternative
                  </p>
                  <p className="text-xs text-muted-foreground">Brand: Example Fashion • Score: +8</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  +8 pts
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
