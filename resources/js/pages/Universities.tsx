import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import AppLayout from "@/layouts/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type University = {
  public_id: string;
  name: string | null;
  description: string | null;
  location: string | null;
  address: string | null;
  phone: string | null;
  type: string | null;
  status: string | null;
  email: string | null;
  image_path: string | null;
  image_background: string | null;
  avatar_url: string | null;
  // Optional fields if the API provides them later
  rating: number | null;
  fees?: number;
};

type PageProps = {
  universitiesData?: University[];
};

export default function Universities() {
  const { t, language } = useLanguage();
  const { universitiesData = [] } = usePage<PageProps>().props;
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState(0);

  const filteredUniversities = universitiesData.filter((uni) => {
    const name = (language === "ar" ? uni.name : uni.name) ?? "";
    const location = uni.location ?? "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = typeof uni.rating === "number" ? uni.rating >= minRating : true;
    return matchesSearch && matchesRating;
  });

  return (
    <AppLayout>
      <Layout>
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h1 className="text-4xl font-bold mb-4">{t('universities')}</h1>
            <p className="text-muted-foreground">{t('exploreUnis')}</p>
          </div>
        </div>

        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full md:w-64 space-y-6">
              <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <Filter className="h-5 w-5" />
                  <span>Filter By</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <Slider
                    defaultValue={[0]}
                    max={5}
                    step={0.5}
                   onValueChange={(vals: number[]) => setMinRating(vals[0] ?? 0)}
                  />
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>0</span>
                    <span>5 Stars</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="riyadh">Riyadh</SelectItem>
                      <SelectItem value="jeddah">Jeddah</SelectItem>
                      <SelectItem value="dammam">Dammam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                  <Input
                    placeholder={t('search')}
                    className="pl-10 rtl:pl-3 rtl:pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select defaultValue="rating">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="fees_low">Lowest Fees</SelectItem>
                    <SelectItem value="fees_high">Highest Fees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredUniversities.map((uni) => (
                  <motion.div
                    key={uni.public_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                    className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <Link href={`/universities/${uni.public_id}`}>
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={uni.image_background ?? uni.image_path ?? "https://via.placeholder.com/640x360"}
                          alt={uni.name ?? "University"}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg line-clamp-1">{uni.name}</h3>
                          <div className="flex items-center gap-1 text-secondary-foreground bg-secondary/20 px-2 py-1 rounded text-xs font-bold">
                            <Star className="h-3 w-3 fill-current" />
                            {uni.rating ?? "-"}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {uni.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {uni.address}
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                           <span className="font-bold text-primary">
                             {typeof uni.fees === "number"
                               ? uni.fees === 0
                                 ? language === "ar"
                                   ? "مجاني"
                                   : "Free"
                                 : `${uni.fees.toLocaleString()} SAR`
                               : "Free"}
                           </span>
                           <Button size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                             {t('viewDetails')}
                           </Button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {filteredUniversities.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No universities found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </AppLayout>
  );
}
