import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { stripHtml } from "string-strip-html";
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import AppLayout from '@/layouts/AppLayout';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  DollarSign,
  GraduationCap,
  Heart,
  MapPin,
  Star,
} from 'lucide-react';
import NotFound from './not-found';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

type UniversityImage = {
  public_id: string;
  path_main: string | null;
  path_thumb: string | null;
  priority: number | null;
  is_active: boolean;
};

type UniversityMajor = {
  public_id: string;
  number_of_seats: number | null;
  admission_rate: number | null;
  study_years: number | null;
  tuition_fee: number | null;
  published: boolean;
  major: {
    public_id: string;
    name: string | null;
    description: string | null;
    designation_jobs: string | null;
    study_years: number | null;
    college: {
      public_id: string;
      name: string | null;
      description: string | null;
      image_path: string | null;
    };
  };
};


type UniversityData = {
  public_id: string;
  name: string | null;
  email: string | null;
  description: string | null;
  location: string | null;
  address: string | null;
  phone: string | null;
  type: string | null;
  status: string | null;
  image_path: string | null;
  image_background: string | null;
  avatar_url: string | null;
  rating?: number | null;
  fees?: number | null;
  images?: UniversityImage[];
  universityMajors?: UniversityMajor[];
};

type PageProps = {
  public_id?: string;
  universityData?: UniversityData;
};

export default function UniversityDetails() {
  const { t, language } = useLanguage();
  const { universityData } = usePage<PageProps>().props;

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRated, setIsRated] = useState(false);
  const [currentUniRating, setCurrentUniRating] = useState<number | null>(
    null,
  );

  const uni = universityData ?? null;
  const { universityMajors = [] } = uni ?? {};
  const placeholderImage = 'https://via.placeholder.com/800x450';

  const galleryImages = useMemo(() => {
    const images = uni?.images?.filter((image) => image.path_main) ?? [];

    if (images.length > 0) {
      return images;
    }

    const fallback =
      uni?.image_path ?? uni?.image_background ?? placeholderImage;

    return [
      {
        public_id: 'fallback',
        path_main: fallback,
        path_thumb: fallback,
        priority: 0,
        is_active: true,
      },
    ];
  }, [uni]);

  const galleryDragLimit = Math.max(0, (galleryImages.length - 1) * 320);

  const groupedColleges = useMemo(() => {
    if (!universityMajors || universityMajors.length === 0)
      return [] as Array<{
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        majors: any[];
      }>;

    const map = new Map<
      string,
      {
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        majors: any[];
      }
    >();

    universityMajors.forEach((um) => {
      const college = um.major.college;
      const collegeId = college.public_id;

      if (!map.has(collegeId)) {
        map.set(collegeId, {
          id: collegeId,
          name: college.name ?? '',
          description: college.description,
          image: college.image_path,
          majors: [],
        });
      }

      map.get(collegeId)?.majors.push({
        id: um.major.public_id,
        name: um.major.name,
        description: um.major.description,
        years: um.study_years ?? um.major.study_years,
        gpa: um.admission_rate,
        fees: um.tuition_fee,
      });
    });

    return Array.from(map.values());
  }, [universityMajors]);

  if (!uni)
    return (
      <AppLayout>
        <NotFound />
      </AppLayout>
    );

  const handleRate = (rating: number) => {
    const isEditing = isRated;

    // إرسال التقييم إلى Laravel عبر Inertia
    router.post(
      `/universities/${uni.public_id}/rate`,
      { rating },
      {
        onSuccess: () => {
          setUserRating(rating);
          setIsRated(true);

          if (uni) {
            const baseRating = currentUniRating ?? uni.rating ?? 0;
            const newRating = isEditing
              ? Number(
                (
                  baseRating +
                  (rating - userRating) * 0.1
                ).toFixed(1),
              )
              : Number(
                ((baseRating * 10 + rating) / 11).toFixed(1),
              );

            setCurrentUniRating(newRating);
          }

          toast.success(
            language === 'ar'
              ? isEditing
                ? 'تم تحديث تقييمك بنجاح'
                : 'شكراً لتقييمك!'
              : isEditing
                ? 'Rating updated successfully'
                : 'Thank you for your rating!',
            {
              icon: (
                <Star className="h-4 w-4 animate-bounce fill-yellow-400 text-yellow-400" />
              ),
              duration: 4000,
            },
          );
        },
        onError: () => {
          toast.error(
            language === 'ar'
              ? 'حدث خطأ أثناء إرسال التقييم'
              : 'Error submitting rating',
          );
        },
      },
    );
  };



  // Articles placeholder until backend provides them for a university
  const uniColleges = groupedColleges;

  return (
    <AppLayout>
      <Layout>
        {/* Hero Header */}
        <div className="relative h-[300px] overflow-hidden bg-muted md:h-[400px]">
          <img
            src={
              uni.image_background ??
              uni.image_path ??
              'https://via.placeholder.com/1200x500'
            }
            alt={uni.name ?? 'University'}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 container mx-auto px-4 pb-8 md:px-0">
            <div className="mb-6 flex items-end gap-6">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-background bg-white shadow-xl md:h-32 md:w-32">
                <img
                  src={
                    uni.avatar_url ??
                    'https://via.placeholder.com/200'
                  }
                  alt="Logo"
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div className="flex-1 pb-2">
                <Link href="/universities">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-4 text-white hover:bg-white/20 hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />{' '}
                    {language === 'ar'
                      ? 'العودة للقائمة'
                      : 'Back to List'}
                  </Button>
                </Link>
                <h1 className="mb-2 text-3xl font-bold text-foreground shadow-sm md:text-5xl">
                  {language === 'ar' ? uni.nameAr : uni.name}
                </h1>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between gap-4 md:flex-row">
              <div className="flex flex-wrap items-center gap-4 text-foreground/80">
                <div className="flex items-center gap-1 text-sm md:text-base">
                  <MapPin className="h-4 w-4" />
                  <span>{uni.location}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm md:text-base">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span>
                      {currentUniRating ??
                        uni.rating ??
                        '-'}{' '}
                    </span>
                  </div>

                  <div className="flex w-full flex-col gap-1 sm:w-auto">
                    <div className="group/rate flex items-center justify-between gap-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md transition-all hover:bg-white/20 sm:justify-start">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() =>
                              handleRate(star)
                            }
                            onMouseEnter={() =>
                              setHoverRating(star)
                            }
                            onMouseLeave={() =>
                              setHoverRating(0)
                            }
                            className="transform cursor-pointer transition-all duration-300 hover:scale-135 focus:outline-none active:scale-95"
                          >
                            <Star
                              className={`h-7 w-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] filter transition-all duration-300 ${star <=
                                  (hoverRating ||
                                    userRating)
                                  ? 'scale-110 fill-yellow-400 text-yellow-400'
                                  : 'text-white/30 hover:text-white/60'
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                      <div className="ml-3 flex items-center border-l border-white/20 pl-3 rtl:mr-3 rtl:ml-0 rtl:border-r rtl:border-l-0 rtl:pr-3 rtl:pl-0">
                        {isRated ? (
                          <div className="flex animate-in items-center gap-2 text-green-400 duration-500 slide-in-from-bottom-2">
                            <div className="rounded-full bg-green-400/20 p-1">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold tracking-tight">
                              {language === 'ar'
                                ? 'تعديل التقييم'
                                : 'Edit Rating'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold tracking-tight whitespace-nowrap text-white opacity-90 group-hover/rate:opacity-100">
                            {language === 'ar'
                              ? 'قيم الآن'
                              : 'Rate Now'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="scrollbar-hide flex h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm whitespace-nowrap data-[state=active]:border-primary data-[state=active]:bg-transparent md:px-6 md:text-base"
              >
                {language === 'ar' ? 'نظرة عامة' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger
                value="colleges"
                className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm whitespace-nowrap data-[state=active]:border-primary data-[state=active]:bg-transparent md:px-6 md:text-base"
              >
                {language === 'ar'
                  ? 'الكليات والتخصصات'
                  : 'Colleges & Majors'}
              </TabsTrigger>

            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                  <section>
                    <h2 className="mb-4 text-2xl font-bold">
                      {language === 'ar'
                        ? 'عن الجامعة'
                        : 'About University'}
                    </h2>
                    <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                      {uni.description}
                    </p>
                  </section>

                  <section>
                    <h2 className="mb-4 text-2xl font-bold">
                      {language === 'ar'
                        ? 'معرض الصور'
                        : 'Gallery'}
                    </h2>
                    <div className="group/gallery relative overflow-hidden">
                      <motion.div
                        className="flex cursor-grab gap-4 active:cursor-grabbing"
                        drag="x"
                        dragConstraints={{
                          right: 0,
                          left: -galleryDragLimit,
                        }}
                        dragElastic={0.08}
                        dragMomentum={true}
                        animate={
                          galleryImages.length > 1
                            ? { x: [0, -200, 0] }
                            : { x: 0 }
                        }
                        transition={
                          galleryImages.length > 1
                            ? {
                              duration: 20,
                              repeat: Infinity,
                              ease: 'linear',
                              repeatType:
                                'reverse',
                            }
                            : undefined
                        }
                      >
                        {galleryImages.map(
                          (image, index) => (
                            <div
                              key={`${image.public_id}-${index}`}
                              className="aspect-video min-w-[300px] overflow-hidden rounded-lg border bg-muted md:min-w-[400px]"
                            >
                              <img
                                src={
                                  image.path_main ??
                                  placeholderImage
                                }
                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                alt={
                                  uni.name ??
                                  'University image'
                                }
                              />
                            </div>
                          ),
                        )}
                      </motion.div>
                      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
                      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <Card className="border-primary/10">
                    <CardContent className="space-y-4 pt-6">
                      <h3 className="border-b pb-2 text-lg font-bold">
                        {language === 'ar'
                          ? 'حقائق سريعة'
                          : 'Key Facts'}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-dashed py-2">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />{' '}
                            {language === 'ar'
                              ? 'الرسوم'
                              : 'Tuition'}
                          </span>
                          <span className="text-sm font-medium">
                            {typeof uni.fees ===
                              'number'
                              ? uni.fees === 0
                                ? language ===
                                  'ar'
                                  ? 'مجاني'
                                  : 'Free'
                                : `${uni.fees} SAR`
                              : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-dashed py-2">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <GraduationCap className="h-4 w-4" />{' '}
                            {language === 'ar'
                              ? 'تأسست'
                              : 'Founded'}
                          </span>
                          <span className="text-sm font-medium">
                            1957
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-dashed py-2">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />{' '}
                            {language === 'ar'
                              ? 'البرامج'
                              : 'Programs'}
                          </span>
                          <span className="text-sm font-medium">
                            120+
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colleges">
              <div className="space-y-8">
                {uniColleges.map((college) => (
                  <Card
                    key={college.id}
                    className="overflow-hidden border-primary/10  gap-0 rounded-xl border py-1"
                  >
                    <div className="flex items-center gap-4 border-b bg-muted/30 p-4">
                      <div className="h-10 w-10 overflow-hidden rounded border bg-white md:h-12 md:w-12">
                        <img
                          src={
                            college.image ??
                            'https://via.placeholder.com/120'
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-bold md:text-xl">
                        {college.name}
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">
                              {language === 'ar'
                                ? 'التخصص'
                                : 'Major'}
                            </TableHead>
                            <TableHead>
                              {language === 'ar'
                                ? 'المدة'
                                : 'Duration'}
                            </TableHead>
                            <TableHead>
                              {language === 'ar'
                                ? 'المعدل'
                                : 'GPA'}
                            </TableHead>
                            <TableHead>
                              {language === 'ar'
                                ? 'الرسوم'
                                : 'Fees'}
                            </TableHead>
                            <TableHead className="text-right">
                              {language === 'ar'
                                ? 'تقديم'
                                : 'Action'}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {college.majors.map(
                            (major) => (
                              <TableRow
                                key={major.id}
                              >
                                <TableCell className="font-medium">
                                  <div className="font-bold">
                                    {
                                      major.name
                                    }
                                  </div>
                                  <div className="mt-1 line-clamp-2 max-w-[300px] text-xs text-muted-foreground">
                                    {/* {major.description ||
                                      ''} */}
                                         {stripHtml(major.description|| '').result}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 text-xs md:text-sm">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    {major.years ??
                                      '-'}{' '}
                                    {language ===
                                      'ar'
                                      ? 'سنوات'
                                      : 'Years'}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs md:text-sm">
                                  {major.gpa ??
                                    '-'}
                                </TableCell>
                                <TableCell className="text-xs font-bold whitespace-nowrap md:text-sm">
                                  {typeof major.fees ===
                                    'number'
                                    ? `${major.fees.toLocaleString()} SAR`
                                    : '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Link
                                    href={`/apply/${uni.public_id}?major=${major.id}`}
                                  >
                                    <Button
                                      size="sm"
                                      className="h-8 bg-secondary px-4 font-bold text-secondary-foreground hover:bg-secondary/90"
                                    >
                                      {t(
                                        'apply',
                                      )}
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>











          </Tabs>
        </div>
      </Layout>
    </AppLayout>
  );
}
