<?php

namespace App\Http\Controllers;

use App\Models\University;
use App\Models\UniversityPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UniversityPostController extends Controller
{
    /**
     * عرض قائمة المقالات - متوافق 100% مع صفحة Articles.tsx
     */
    public function index(Request $request): Response
    {
        // استخدام withCount لجلب الإعجابات في استعلام واحد (أداء سريع)
        // واستخدام with لجلب بيانات الجامعة المحددة فقط
        $query = UniversityPost::query()
            ->with(['university:id,public_id,name,avatar_url'])
            ->withCount('likes')
            ->latest();

        // التصفية والبحث (Backend) لضمان عدم ثقل الصفحة
        if ($request->filled('university_id') && $request->university_id !== 'all') {
            $query->whereHas('university', fn($q) => $q->where('public_id', $request->university_id));
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // تحويل البيانات لتطابق الـ Type "Article" المعرف في React
        $articles = $query->paginate(15)->through(fn ($post) => [
            'public_id'   => $post->public_id,
            'title'       => $post->title,
            'content'     => $post->content,
            'image_path'  => $post->image_path ? asset('storage/' . $post->image_path) : null,
            'created_at'  => $post->created_at->toISOString(),
            'likes_count' => (int) $post->likes_count,
            'university'  => $post->university ? [
                'public_id'  => $post->university->public_id,
                'name'        => $post->university->name,
                'avatar_url'  => $post->university->avatar_url ? asset('storage/' . $post->university->avatar_url) : null,
            ] : null,
        ]);

        // جلب قائمة الجامعات لفلتر السليكت
        $universitiesList = University::select('public_id', 'name')->get();

        return Inertia::render('Articles', [
            'articlesData'     => $articles,
            'universitiesList' => $universitiesList,
        ]);
    }
}
