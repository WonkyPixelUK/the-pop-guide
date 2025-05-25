import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye, Calendar, User, TrendingUp } from "lucide-react";
import { useCustomLists } from "@/hooks/useCustomLists";
import { Link } from "react-router-dom";

const BrowseLists = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { publicLists, isLoadingPublicLists } = useCustomLists();

  const filteredLists = publicLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (list.description && list.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ((list as any).profiles?.full_name && (list as any).profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateListValue = (list: any) => {
    if (!list.list_items) return 0;
    return list.list_items.reduce((total: number, item: any) => {
      return total + (item.funko_pops?.estimated_value || 0);
    }, 0);
  };

  if (isLoadingPublicLists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading public lists...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg" alt="PopGuide Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Browse Public Lists</h1>
          <p className="text-xl text-gray-400 mb-6">
            Discover amazing Funko Pop collections shared by the community
          </p>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search lists, creators, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="text-center py-6">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{publicLists.length}</p>
              <p className="text-gray-400">Public Lists</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="text-center py-6">
              <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {publicLists.reduce((total, list) => total + (list.list_items?.length || 0), 0)}
              </p>
              <p className="text-gray-400">Total Items</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="text-center py-6">
              <User className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {new Set(publicLists.map(list => list.user_id)).size}
              </p>
              <p className="text-gray-400">Contributors</p>
            </CardContent>
          </Card>
        </div>

        {/* Lists Grid */}
        {filteredLists.length === 0 ? (
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="text-center py-8">
              <p className="text-gray-400 mb-4">
                {searchTerm ? "No lists match your search." : "No public lists available yet."}
              </p>
              <Link to="/dashboard">
                <Button className="bg-white text-[#232837] hover:bg-gray-100 font-semibold shadow-none">
                  Create the First List
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
              <Card key={list.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                          {list.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 ml-2">
                      <Eye className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-lg font-bold text-orange-500">{list.list_items?.length || 0}</p>
                      <p className="text-xs text-gray-400">Items</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-lg font-bold text-green-500">${calculateListValue(list).toFixed(0)}</p>
                      <p className="text-xs text-gray-400">Value</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {(list as any).profiles?.full_name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(list.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <Link to={`/lists/${list.id}`}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      View List
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseLists;
