import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Star, Tag, Store, Calendar, CheckCircle, Users, Zap, MessageCircle } from "lucide-react";
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useRetailer } from '@/hooks/useRetailer';
import { useRetailerProducts } from '@/hooks/useRetailerProducts';
import { useRetailerShows } from '@/hooks/useRetailerShows';
import { useRetailerReviews } from '@/hooks/useRetailerReviews';
import { useRetailerAnalytics } from '@/hooks/useRetailerAnalytics';

const RetailerProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: retailer, isLoading, error } = useRetailer(slug || "");
  const { data: products = [], isLoading: loadingProducts } = useRetailerProducts(retailer?.id || "");
  const { data: shows = [], isLoading: loadingShows } = useRetailerShows(retailer?.id || "");
  const { data: reviews = [], isLoading: loadingReviews } = useRetailerReviews(retailer?.id || "");
  const { data: analytics, isLoading: loadingAnalytics } = useRetailerAnalytics(retailer?.id || "");

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">Loading retailer...</div>;
  }
  if (error || !retailer) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-red-500">Retailer not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Retailer Card */}
          <Card className="bg-gray-800/50 border-gray-700 w-full md:w-1/3">
            <CardHeader className="flex flex-col items-center gap-4 pb-2">
              <img
                src={retailer.logo_url || "/lovable-uploads/retailer-placeholder.png"}
                alt={retailer.name}
                className="w-24 h-24 object-contain rounded bg-gray-900 border border-gray-700 mb-2"
              />
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                {retailer.name}
                {retailer.is_official && (
                  <Badge className="bg-blue-900/80 text-blue-200 text-xs font-semibold px-2 py-0.5 ml-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Official
                  </Badge>
                )}
              </CardTitle>
              <div className="flex flex-wrap gap-1 mt-1">
                {(retailer.tags || []).map((tag: string) => (
                  <Badge key={tag} className="bg-gray-700 text-gray-200 text-xs px-2 py-0.5 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {tag}
                  </Badge>
                ))}
              </div>
              {retailer.website && (
                <a
                  href={retailer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:underline flex items-center gap-1 mt-2"
                >
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-4">Follow Retailer</Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4 line-clamp-3 text-center">{retailer.description}</p>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span><Users className="inline w-4 h-4 mr-1" />{analytics?.followers ?? 0} followers</span>
                <span><Zap className="inline w-4 h-4 mr-1" />{analytics?.views ?? 0} views</span>
                <span><Star className="inline w-4 h-4 mr-1" />{analytics?.clicks ?? 0} clicks</span>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Products/Deals */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Store className="w-5 h-5" /> Products & Deals</h2>
              {loadingProducts ? (
                <div className="text-gray-400">Loading products...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product: any) => (
                    <Card key={product.id} className="bg-gray-800/70 border-gray-700">
                      <CardContent className="p-4 flex flex-col items-center">
                        <img src={product.image_url || "/lovable-uploads/retailer-placeholder.png"} alt={product.name} className="w-20 h-20 object-contain mb-2 rounded" />
                        <div className="font-semibold text-white text-center text-sm mb-1">{product.name}</div>
                        <div className="text-xs text-gray-400 mb-2">£{product.price?.toFixed(2) ?? "-"}</div>
                        {product.is_deal && <Badge className="bg-green-700 text-green-200 text-xs mb-1">Deal</Badge>}
                        {product.is_incoming && <Badge className="bg-yellow-700 text-yellow-200 text-xs mb-1">Incoming</Badge>}
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-2">View Product</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Whatnot Shows */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Upcoming Shows</h2>
              {loadingShows ? (
                <div className="text-gray-400">Loading shows...</div>
              ) : (
                <div className="space-y-4">
                  {shows.map((show: any) => (
                    <Card key={show.id} className="bg-gray-800/70 border-gray-700">
                      <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="font-semibold text-white text-lg mb-1">{show.title}</div>
                          <div className="text-xs text-gray-400 mb-2">{new Date(show.show_time).toLocaleString()}</div>
                          <a href={show.show_url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" /> Join Show
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5" /> Reviews</h2>
              {loadingReviews ? (
                <div className="text-gray-400">Loading reviews...</div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review.id} className="bg-gray-800/70 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">{review.user}</span>
                          <span className="flex gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400" />
                            ))}
                          </span>
                        </div>
                        <div className="text-gray-300">{review.review}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default RetailerProfile; 