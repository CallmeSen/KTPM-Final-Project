import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheItem } from 'src/interfaces/CacheItem.interface';


@Injectable()
export class NotificationCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, CacheItem>(); 

  private ttl = 60 * 1000; 

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const request = context.switchToHttp().getRequest();

    const userId = request.user?.id || 'guest';

    const cacheKey = `notifications:${userId}`;

    const cachedItem = this.cache.get(cacheKey);


    if (cachedItem && cachedItem.expireAt > Date.now()) {
      return of(cachedItem.data);
    }

  
    return next.handle().pipe(
      tap((data) => {
        this.cache.set(cacheKey, { data, expireAt: Date.now() + this.ttl });
      }),
    );
  }
}
