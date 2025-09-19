import { z } from 'zod';

// ログインフォームのバリデーションスキーマ
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(8, 'パスワードは8文字以上で入力してください'),
});

// 登録フォームのバリデーションスキーマ
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(255, '名前は255文字以内で入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください'),
  password_confirmation: z
    .string()
    .min(1, 'パスワード確認を入力してください'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'パスワードが一致しません',
  path: ['password_confirmation'],
});

// TypeScriptの型定義
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;