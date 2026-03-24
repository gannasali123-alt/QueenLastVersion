import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import AppLayout from "@/layouts/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Heart, ArrowRight, University, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Article = {
  public_id: string;
  title: string;
  content: string;
  image_path: string;
  created_at: string;
  likes_count: number;
  university?: {
    public_id: string;
    name: string;
    avatar_url: string;
  };
};

type PageProps = {
  articlesData: Article[]; // 🔥 عدلنا هنا
  universitiesList?: { public_id: string; name: string }[];
};

export default function Articles() {
  const { t, language } = useLanguage();

  // 🔥 عدلنا استقبال البيانات فقط
  const { articlesData = [], universitiesList = [] } =
    usePage<PageProps>().props;

  const [search, setSearch] = useState("");
  const [selectedUni, setSelectedUni] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(6);
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

  // 🔥 عدلنا هذا السطر فقط
  const articles = articlesData;

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = new Set(likedArticles);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedArticles(newLiked);
  };

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    if (search) {
      result = result.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedUni !== "all") {
      result = result.filter(
        a => a.university?.public_id === selectedUni
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      if (sortBy === "oldest")
        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      if (sortBy === "popular")
        return (b.likes_count || 0) - (a.likes_count || 0);
      return 0;
    });

    return result;
  }, [articles, search, selectedUni, sortBy]);

  const displayedArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;
  return (
    <AppLayout>
      <Layout>
        {/* هيدر الصفحة */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{t('articles')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{t('latestArticles')}</p>
          </div>
        </div>

        <div className="container mx-auto py-12 px-4 max-w-7xl">
          {/* شريط الأدوات: البحث والفلترة */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 bg-card p-6 rounded-2xl border shadow-sm items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">{t('search')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                <Input
                  placeholder={language === 'ar' ? 'بحث في العناوين...' : 'Search titles...'}
                  className="pl-10 rtl:pl-3 rtl:pr-10 h-11 rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-64 space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">{language === 'ar' ? 'الجامعة' : 'University'}</label>
              <Select value={selectedUni} onValueChange={setSelectedUni}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder={language === 'ar' ? 'كل الجامعات' : 'All Universities'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'كل الجامعات' : 'All Universities'}</SelectItem>
                  {universitiesList.map(uni => (
                    <SelectItem key={uni.public_id} value={uni.public_id}>{uni.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48 space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground ml-1">{language === 'ar' ? 'ترتيب حسب' : 'Sort By'}</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{language === 'ar' ? 'الأحدث' : 'Newest'}</SelectItem>
                  <SelectItem value="oldest">{language === 'ar' ? 'الأقدم' : 'Oldest'}</SelectItem>
                  <SelectItem value="popular">{language === 'ar' ? 'الأكثر تفاعلاً' : 'Most Liked'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* شبكة المقالات */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {displayedArticles.map((article) => (
                <motion.div
                  key={article.public_id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col group border-primary/5 hover:border-primary/20 rounded-3xl bg-card/50 backdrop-blur-sm">
                    {/* هيدر المقال - نمط فيسبوك */}
                    <div className="p-4 flex items-center gap-3 border-b border-primary/5">
                      <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage src={article.university?.avatar_url} />
                        <AvatarFallback><University className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <Link
                          href={`/universities/${article.university?.public_id}`}
                          className="text-sm font-bold hover:text-primary transition-colors leading-none mb-1"
                        >
                          {article.university?.name}
                        </Link>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </div>
                      </div>
                    </div>

                    {/* صورة المقال */}
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={article.image_path}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl leading-tight font-bold group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {article.content}
                      </p>
                    </CardContent>

                    <CardFooter className="pt-4 pb-6 flex justify-between items-center px-6">
                       <div className="flex items-center gap-4">
                         <Button
                           variant="ghost"
                           size="icon"
                           className={`h-9 w-9 rounded-full transition-all ${likedArticles.has(article.public_id) ? 'bg-red-50 text-red-500 shadow-sm' : 'hover:bg-red-50 hover:text-red-500'}`}
                           onClick={(e) => toggleLike(article.public_id, e)}
                         >
                           <Heart className={`h-5 w-5 ${likedArticles.has(article.public_id) ? 'fill-current' : ''}`} />
                         </Button>
                         <span className="text-sm font-bold text-muted-foreground">
                           {(article.likes_count || 0) + (likedArticles.has(article.public_id) ? 1 : 0)}
                         </span>
                       </div>

                       <Dialog>
                         <DialogTrigger asChild>
                           <Button variant="outline" size="sm" className="rounded-full font-bold border-primary/20 hover:bg-primary hover:text-white transition-all">
                             {t('readMore')}
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="max-w-3xl rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
                           <div className="relative h-64 md:h-80">
                             <img src={article.image_path} className="w-full h-full object-cover" alt="" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 flex items-end p-8">
                                <div className="space-y-2">
                                   <h2 className="text-white text-3xl font-bold">{article.title}</h2>
                                </div>
                             </div>
                           </div>
                           <div className="p-8 max-h-[50vh] overflow-y-auto">
                             <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                               {article.content}
                             </p>
                           </div>
                         </DialogContent>
                       </Dialog>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* زر تحميل المزيد */}
          {hasMore && (
            <div className="mt-16 text-center">
              <Button
                onClick={() => setVisibleCount(prev => prev + 6)}
                size="lg"
                className="px-12 py-6 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
              >
                {language === 'ar' ? 'تحميل المزيد من المقالات' : 'Load More Articles'}
              </Button>
            </div>
          )}
        </div>
      </Layout>
    </AppLayout>
  );
}
