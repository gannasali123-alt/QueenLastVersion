import { Layout } from "@/components/layout/Layout";
import { stripHtml } from "string-strip-html";

import AppLayout from "@/layouts/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import {
  Clock,
  GraduationCap,
  MapPin,
  Star,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

/* =======================
   Types (صح مش any)
======================= */
interface Major {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  years: number;
  gpa: number;
  fees: number;
  careerOpportunities: string[];
}

interface College {
  id: string;
  name: string;
  nameAr: string;
  image: string;
  majors: Major[];
}

interface University {
  id: string;
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  image: string;
  rating: number;
}

interface PageProps {
  colleges: College[];
  universities: University[];
}

/* =======================
   Component
======================= */
export default function Colleges() {
  const { colleges, universities } = usePage<PageProps>().props;
  const { t, language } = useLanguage();

  const [selectedMajorId, setSelectedMajorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedMajor = colleges
    .flatMap(college => college.majors)
    .find(major => major.id === selectedMajorId);

  const filteredUnis = universities.filter((uni) =>
    (
      language === "ar" ? uni.nameAr : uni.name
    ).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (
      language === "ar" ? uni.locationAr : uni.location
    ).toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <AppLayout>
      <Layout>
        <div className="bg-muted/30 py-12 px-4 md:px-0">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('colleges')}</h1>
            <p className="text-muted-foreground">{t('exploreColleges')}</p>
          </div>
        </div>

        <div className="container mx-auto py-12 px-4 md:px-0">
          {!selectedMajorId ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {colleges.map((college) => (
                <AccordionItem key={college.id} value={college.id} className="border rounded-lg px-4 bg-card shadow-sm">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 text-left rtl:text-right w-full">
                      <div className="h-12 w-12 md:h-16 md:w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img src={college.image} className="w-full h-full object-cover" alt={college.name} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold">{language === 'ar' ? college.nameAr : college.name}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground font-normal">
                          {college.majors.length} Majors Available
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6 border-t mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {college.majors.map((major) => (
                        <Card key={major.id} className="p-6 hover:shadow-md transition-all border-border/50">
                          <h4 className="font-bold text-lg mb-2">{language === 'ar' ? major.nameAr : major.name}</h4>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {language === 'ar' ? stripHtml(major.descriptionAr ?? "").result : stripHtml(major.description ?? "").result}


                          </p>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{major.years} {language === 'ar' ? 'سنوات' : 'Years'}</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-primary uppercase tracking-wider">{language === 'ar' ? 'الفرص الوظيفية' : 'Career Opportunities'}</p>
                              <div className="flex flex-wrap gap-1">
                                {(language === 'ar' ? major.careerOpportunitiesAr : major.careerOpportunities)?.map((job, idx) => (
                                  <span key={idx} className="bg-primary/5 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/10">
                                    {job}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() => setSelectedMajorId(major.id)}
                            className="w-full bg-secondary text-secondary-foreground font-bold hover:bg-secondary/90"
                          >
                            {language === 'ar' ? 'عرض الجامعات والتقديم' : 'View Unis & Apply'}
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button variant="ghost" onClick={() => setSelectedMajorId(null)} className="mb-4">
                 {language === 'ar' ? '← العودة للكليات' : '← Back to Colleges'}
              </Button>

              <div className="bg-card p-6 rounded-2xl border border-primary/10 shadow-sm mb-12">
                 <h2 className="text-3xl font-bold mb-2 text-primary">{language === 'ar' ? selectedMajor?.nameAr : selectedMajor?.name}</h2>
                 <p className="text-muted-foreground max-w-3xl mb-4">{language === 'ar' ? selectedMajor?.descriptionAr : selectedMajor?.description}</p>
                 <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{selectedMajor?.years} {language === 'ar' ? 'سنوات' : 'Years'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-sm">
                      <GraduationCap className="h-4 w-4" />
                      <span>GPA {selectedMajor?.gpa}+</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                 <aside className="w-full md:w-64 space-y-6">
                   <div className="bg-card p-6 rounded-xl border shadow-sm sticky top-24">
                     <div className="flex items-center gap-2 font-bold mb-4">
                       <Filter className="h-4 w-4" />
                       <span>{language === 'ar' ? 'تصفية' : 'Filter'}</span>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase text-muted-foreground">{language === 'ar' ? 'بحث' : 'Search'}</label>
                          <Input
                            placeholder={t('search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase text-muted-foreground">{language === 'ar' ? 'ترتيب حسب' : 'Sort By'}</label>
                          <Select defaultValue="fees">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fees">{language === 'ar' ? 'الرسوم' : 'Fees'}</SelectItem>
                              <SelectItem value="rating">{language === 'ar' ? 'التقييم' : 'Rating'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                     </div>
                   </div>
                 </aside>

                 <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredUnis.map((uni) => (
                        <Card key={uni.id} className="overflow-hidden hover:shadow-lg transition-all border-border/50 group">
                          <div className="aspect-video relative overflow-hidden">
                             <img src={uni.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                             <div className="absolute top-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                {uni.rating}
                              </div>
                          </div>
                          <CardContent className="p-6">
                             <h3 className="text-xl font-bold mb-1">{language === 'ar' ? uni.nameAr : uni.name}</h3>
                             <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                               <MapPin className="h-3.3 w-3.3" />
                               {language === 'ar' ? uni.locationAr : uni.location}
                             </div>
                             <div className="flex justify-between items-center mt-4 pt-4 border-t">
                               <div className="text-primary font-bold">
                                 {selectedMajor?.fees.toLocaleString()} SAR
                               </div>
                               <Link href={`/apply/${uni.id}?major=${selectedMajorId}`}>
                                 <Button size="sm" className="bg-secondary text-secondary-foreground font-bold">
                                   {t('apply')}
                                 </Button>
                               </Link>
                             </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AppLayout>
  );
}
