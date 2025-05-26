import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Tag, Calendar, Star, DollarSign, Zap, Plus, Edit, Trash2, Users } from "lucide-react";
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useRetailer } from '@/hooks/useRetailer';
import { useRetailerProducts } from '@/hooks/useRetailerProducts';
import { useRetailerProductMutations } from '@/hooks/useRetailerProductMutations';
import RetailerProductModal from '@/components/RetailerProductModal';
import { useParams } from "react-router-dom";
import { useRetailerPayments } from '@/hooks/useRetailerPayments';
import RetailerPaymentModal from '@/components/RetailerPaymentModal';

const RetailerDashboard = () => {
  const [tab, setTab] = useState("profile");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const { data: retailer, isLoading, error } = useRetailer(slug || "");
  const { data: products = [], isLoading: loadingProducts } = useRetailerProducts(retailer?.id || "");
  const { createProduct, updateProduct, deleteProduct } = useRetailerProductMutations(retailer?.id || "");
  const { data: payments = [], isLoading: loadingPayments } = useRetailerPayments(retailer?.id || "");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const isOwner = user && retailer && user.id === retailer.user_id;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">Loading retailer...</div>;
  if (error || !retailer) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-red-500">Retailer not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-2"><Store className="w-8 h-8 text-orange-500" /> Retailer Dashboard</h1>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex w-full bg-gray-800 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="shows">Shows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-gray-800/50 border-gray-700 mb-8">
              <CardHeader className="flex flex-col md:flex-row items-center gap-6 pb-2">
                <img
                  src={retailer.logo_url}
                  alt={retailer.name}
                  className="w-24 h-24 object-contain rounded bg-gray-900 border border-gray-700 mb-2"
                />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-white text-2xl flex items-center gap-2">
                    {retailer.name}
                    {retailer.is_official && (
                      <Badge className="bg-blue-900/80 text-blue-200 text-xs font-semibold px-2 py-0.5 ml-2 flex items-center gap-1">
                        Official
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
                  <div className="mt-4 flex flex-col gap-2">
                    <Input className="bg-gray-800 border-gray-700 text-white" value={retailer.name} readOnly />
                    <Input className="bg-gray-800 border-gray-700 text-white" value={retailer.website} readOnly />
                  </div>
                </div>
                {isOwner && <Button className="bg-blue-900 hover:bg-blue-800 text-white">Edit Profile</Button>}
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4 line-clamp-3 text-center">{retailer.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Products</h2>
              {isOwner && (
                <Button className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2" onClick={() => { setEditProduct(null); setProductModalOpen(true); }}><Plus className="w-4 h-4" /> Add Product</Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingProducts ? (
                <div className="col-span-full text-center text-gray-400 py-12">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-12">No products found.</div>
              ) : (
                products.map((product: any) => (
                  <Card key={product.id} className="bg-gray-800/70 border-gray-700">
                    <CardContent className="p-4 flex flex-col items-center">
                      <img src={product.image_url || product.image} alt={product.name} className="w-20 h-20 object-contain mb-2 rounded" />
                      <div className="font-semibold text-white text-center text-sm mb-1">{product.name}</div>
                      <div className="text-xs text-gray-400 mb-2">£{product.price?.toFixed(2) ?? "-"}</div>
                      {product.is_deal && <Badge className="bg-green-700 text-green-200 text-xs mb-1">Deal</Badge>}
                      {product.is_incoming && <Badge className="bg-yellow-700 text-yellow-200 text-xs mb-1">Incoming</Badge>}
                      {isOwner && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-blue-900 hover:bg-blue-800 text-white flex items-center gap-1" onClick={() => { setEditProduct(product); setProductModalOpen(true); }}><Edit className="w-4 h-4" /> Edit</Button>
                          <Button size="sm" className="bg-red-700 hover:bg-red-800 text-white flex items-center gap-1" onClick={() => deleteProduct.mutate(product.id)} disabled={deleteProduct.isPending}><Trash2 className="w-4 h-4" /> Delete</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <RetailerProductModal
              open={productModalOpen}
              onOpenChange={setProductModalOpen}
              initialData={editProduct}
              onSubmit={async (values: any) => {
                if (editProduct) {
                  await updateProduct.mutateAsync({ id: editProduct.id, ...values });
                } else {
                  await createProduct.mutateAsync(values);
                }
                setProductModalOpen(false);
                setEditProduct(null);
              }}
              loading={createProduct.isPending || updateProduct.isPending}
            />
          </TabsContent>

          {/* Shows Tab */}
          <TabsContent value="shows">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Whatnot Shows</h2>
              {/* Add show logic here if needed */}
            </div>
            {/* ...existing code... */}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="bg-gray-800/50 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2"><Zap className="w-5 h-5 text-orange-500" /> Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8 text-lg">
                  <div><span className="text-orange-500 font-bold">{retailer.analytics?.views ?? 0}</span> Views</div>
                  <div><span className="text-orange-500 font-bold">{retailer.analytics?.clicks ?? 0}</span> Clicks</div>
                  <div><span className="text-orange-500 font-bold">{retailer.analytics?.followers ?? 0}</span> Followers</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="bg-gray-800/50 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" /> Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {isOwner && (
                  <div className="mb-4">
                    <Button className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2" onClick={() => setPaymentModalOpen(true)}><Plus className="w-4 h-4" /> Pay for Directory Listing</Button>
                  </div>
                )}
                <RetailerPaymentModal open={paymentModalOpen} onOpenChange={setPaymentModalOpen} />
                {loadingPayments ? (
                  <div className="text-gray-400">Loading payments...</div>
                ) : payments.length === 0 ? (
                  <div className="text-gray-400">No payments found.</div>
                ) : (
                  <div className="space-y-2">
                    {payments.map((payment: any) => (
                      <div key={payment.id} className="flex items-center gap-4 bg-gray-900 p-3 rounded">
                        <div className="flex-1">
                          <span className="text-white font-semibold">£{payment.amount?.toFixed(2) ?? '-'}</span>
                          <span className="text-gray-400 ml-2">Paid: {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}</span>
                          <span className="text-gray-400 ml-2">Expires: {payment.expires_at ? new Date(payment.expires_at).toLocaleDateString() : '-'}</span>
                        </div>
                        <Badge className="bg-green-700 text-green-200 text-xs">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default RetailerDashboard; 