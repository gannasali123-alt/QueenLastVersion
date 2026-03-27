<?php

namespace App\Http\Middleware;
use Illuminate\Support\Facades\Auth;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
      if (Auth::guard('admin')->check()) {
            $admin = Auth::guard('admin')->user();

            if ($admin->status === 'inactive') {
                abort(403, 'Wrong Jihad');
            }
        }
        return $next($request);
    }
}
