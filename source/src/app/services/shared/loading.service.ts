import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * ローディング画面の表示制御サービス
 */
@Injectable()
export class LoadingService {

    private destroy$: Subject<boolean>;

    private toStartSubscriber: Subject<void>;

    private toStartSubscribe$: Observable<void>;

    private toStopSubscriber: Subject<boolean>;

    private toStopSubscribe$: Observable<boolean>;

    /**
     * コンストラクタ
     */
    constructor(
    ) {
        this.initSubject();
    }

    private initSubject(): void {
        this.destroy$ = new Subject<boolean>();
        this.toStartSubscriber = new Subject<void>();
        this.toStartSubscribe$ = this.toStartSubscriber.asObservable();
        this.toStopSubscriber = new Subject<boolean>();
        this.toStopSubscribe$ = this.toStopSubscriber.asObservable();
    }

    /**
     * subscribe情報を破棄する。
     */
    public unsubscribe(): void {
        this.destroy$.next(true);
        this.destroy$.complete();

        this.initSubject();
    }

    /**
     * ローディング画面を表示する。
     */
    public start(): void {
        this.toStartSubscriber.next();
    }

    /**
     * start関数呼び出し時に引数に指定した関数を実行する。
     */
    public onStart(callback: Function): void {
        this.toStartSubscribe$.pipe(takeUntil(this.destroy$)).subscribe(
            () => {
                callback();
            }
        );
    }

    /**
     * ローディング画面を非表示にする。
     */
    public stop(isForced: boolean = false): void {
        this.toStopSubscriber.next(isForced);
    }

    /**
     * stop関数呼び出し時に引数に指定した関数を実行する。
     */
    public onStop(callback: Function): void {
        this.toStopSubscribe$.pipe(takeUntil(this.destroy$)).subscribe(
            (isForced: boolean) => {
                callback(isForced);
            }
        );
    }

}
