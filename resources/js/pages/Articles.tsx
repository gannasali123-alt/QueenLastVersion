import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import AppLayout from "@/layouts/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { articles } from "@/lib/mockData";
import { Link } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Articles() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = new Set(likedArticles);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedArticles(newLiked);
  };

  const filteredArticles = articles.filter(a => {
    const title = language === 'ar' ? a.titleAr : a.title;
    const uni = language === 'ar' ? a.universityNameAr : a.universityName;
    return title.toLowerCase().includes(search.toLowerCase()) ||
           uni.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AppLayout>
      <Layout>
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">{t('articles')}</h1>
            <p className="text-muted-foreground">{t('latestArticles')}</p>
          </div>
        </div>

        <div className="container mx-auto py-12 px-4">
          <div className="max-w-md mb-8 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
             <Input
               placeholder={t('search')}
               className="pl-10 rtl:pl-3 rtl:pr-10"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all h-full flex flex-col group border-border/50 gap-6 rounded-xl border py-6">
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={article.image}
                      alt={language === 'ar' ? article.titleAr : article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Link
                        href={`/universities/${article.universityId}`}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-full font-bold hover:bg-primary/20 transition-colors"
                      >
                         {language === 'ar' ? article.universityNameAr : article.universityName}
                      </Link>
                    </div>
                    <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                      {language === 'ar' ? article.titleAr : article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.content}
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4 text-xs text-muted-foreground flex justify-between items-center">
                     <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1">
                         <Calendar className="h-3 w-3" />
                         {article.date}
                       </div>
                       <div className="flex items-center gap-1">
                         <Button
                           variant="ghost"
                           size="icon"
                           className={`h-8 w-8 rounded-full transition-colors ${likedArticles.has(article.id) ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
                           onClick={(e) => toggleLike(article.id, e)}
                         >
                           <Heart className={`h-4 w-4 ${likedArticles.has(article.id) ? 'fill-current' : ''}`} />
                         </Button>
                         <span className="text-muted-foreground">
                           {article.likes + (likedArticles.has(article.id) ? 1 : 0)}
                         </span>
                       </div>
                     </div>
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button variant="link" size="sm" className="p-0 h-auto font-bold text-primary">
                           {t('readMore')} <ArrowRight className="ml-1 h-3 w-3 rtl:rotate-180 rtl:ml-0 rtl:mr-1" />
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-2xl">
                         <DialogHeader>
                           <DialogTitle className="text-2xl font-bold">{language === 'ar' ? article.titleAr : article.title}</DialogTitle>
                           <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                              <span className="font-bold text-primary">{language === 'ar' ? article.universityNameAr : article.universityName}</span>
                              <span>{article.date}</span>
                           </div>
                         </DialogHeader>
                         <div className="mt-4 space-y-4">
                           <img src={article.image} className="w-full h-64 object-cover rounded-lg" alt="" />
                           <p className="text-muted-foreground leading-relaxed text-lg">
                             {article.content}
                           </p>
                         </div>
                       </DialogContent>
                     </Dialog>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Layout>
    </AppLayout>
  );
}
