import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, Store, User, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';

const placeholderRetailers = [
  {
    id: "1",
    name: "PopMania UK",
    slug: "popmania-uk",
    logo_url: "/lovable-uploads/retailer1.png",
    is_official: true,
    tags: ["Official Retailer", "UK", "Deals"],
    description: "The UK's #1 Funko retailer.",
  },
  {
    id: "2",
    name: "Vinyl Vault",
    slug: "vinyl-vault",
    logo_url: "/lovable-uploads/retailer2.png",
    is_official: false,
    tags: ["US", "Whatnot Shows"],
    description: "Rare and vaulted Funkos, shipped worldwide.",
  },
];

const placeholderUsers = [
  {
    id: "u1",
    username: "richc",
    display_name: "Rich Copestake",
    avatar_url: "/lovable-uploads/user1.png",
    bio: "Collector, trader, Funko fan.",
    tags: ["UK", "Collector"],
  },
  {
    id: "u2",
    username: "popfan99",
    display_name: "Pop Fan 99",
    avatar_url: "/lovable-uploads/user2.png",
    bio: "Marvel & DC completist.",
    tags: ["US", "Marvel", "DC"],
  },
];

const DirectoryAll = () => {
  const [search, setSearch] = useState("");
  const filteredRetailers = placeholderRetailers.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredUsers = placeholderUsers.filter(u =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-4xl font-bold text-white">Directory</h1>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search users or retailers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white placeholder-gray-400 w-full md:w-80"
            />
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-orange-400 mb-4">Retailers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredRetailers.map(retailer => (
            <Card key={retailer.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <img
                  src={retailer.logo_url}
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
                    {retailer.tags.map(tag => (
                      <Badge key={tag} className="bg-gray-700 text-gray-200 text-xs px-2 py-0.5 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4 line-clamp-2">{retailer.description}</p>
                <Link to={`/retailers/${retailer.slug}`} className="text-blue-400 hover:underline flex items-center gap-1">
                  <Store className="w-4 h-4" /> View Retailer
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-blue-400 mb-4">Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUsers.map(user => (
            <Card key={user.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  className="w-16 h-16 object-contain rounded-full bg-gray-900 border border-gray-700"
                />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    {user.display_name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.tags.map(tag => (
                      <Badge key={tag} className="bg-gray-700 text-gray-200 text-xs px-2 py-0.5 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400">@{user.username}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4 line-clamp-2">{user.bio}</p>
                <Link to={`/profile/${user.username}`} className="text-blue-400 hover:underline flex items-center gap-1">
                  <User className="w-4 h-4" /> View Profile
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default DirectoryAll; 