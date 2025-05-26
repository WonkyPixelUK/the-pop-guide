import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, Globe, Store, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useRetailers } from '@/hooks/useRetailers';

const Directory = () => {
  const [search, setSearch] = useState("");
  const { data: retailers = [], isLoading, error } = useRetailers();

  const filtered = retailers.filter((r: any) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.tags || []).some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-4xl font-bold text-white">Retailer Directory</h1>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search retailers or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white placeholder-gray-400 w-full md:w-80"
            />
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {isLoading && (
          <div className="text-center text-gray-400 py-12">Loading retailers...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-12">Failed to load retailers.</div>
        )}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12">No retailers found.</div>
            ) : (
              filtered.map((retailer: any) => (
                <Card key={retailer.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <img
                      src={retailer.logo_url || "/lovable-uploads/retailer-placeholder.png"}
                      alt={retailer.name}
                      className="w-16 h-16 object-contain rounded bg-gray-900 border border-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-xl flex items-center gap-2">
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4 line-clamp-2">{retailer.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      {retailer.website && (
                        <a
                          href={retailer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-4 h-4" /> Website
                        </a>
                      )}
                      <Link to={`/retailers/${retailer.slug}`} className="text-blue-400 hover:underline flex items-center gap-1">
                        <Store className="w-4 h-4" /> View Profile
                      </Link>
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">Follow Retailer</Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Directory; 