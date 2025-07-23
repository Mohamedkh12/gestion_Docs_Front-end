'use client';

import { useRouter } from "next/navigation";
import { IconLock, IconMail,IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { signInSchema } from "../../types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { useState } from "react";

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const response = await api.post('/api/users/login', {
                email: data.email,
                password: data.password,
            });
            router.push('/dashboard');
        } catch (e: any) {
            const msg = e.response?.data?.error || 'Email ou mot de passe incorrect';
            setSubmitError(msg);
        }
    };

    return (
        <div className="page page-center ">
            <div className="container-xl py-4">
                <div className="row align-items-center">
                    {/* Formulaire  */}
                    <div className="col-md-6 d-flex justify-content-center">
                        <div className="card card-md w-100" style={{ maxWidth: "450px",maxHeight:"700px"}}>
                            <div className="card-body">
                                <h2 className="h2 text-center mb-4">Connexion à votre compte</h2>

                                {submitError && (
                                    <div className="alert alert-danger">{submitError}</div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                    <div className="mb-3">
                                        <label className="form-label">Adresse email</label>
                                        <div className="input-group input-group-flat">
                                              <span className="input-group-text">
                                                <IconMail size={16} />
                                              </span>
                                            <input
                                                type="email"
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                placeholder="votre@email.com"
                                                {...register('email')}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        {errors.email && (
                                            <div className="form-hint text-danger">{errors.email.message}</div>
                                        )}
                                    </div>

                                   <div className="mb-2">
                                    <label className="form-label">Mot de passe</label>
                                    <div className="input-group input-group-flat">
                                            <span className="input-group-text">
                                                <IconLock size={16} />
                                            </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            placeholder="Votre mot de passe"
                                            {...register('password')}
                                            disabled={isSubmitting}
                                        />
                                        <span className="input-group-text">
                                                <button
                                                    type="button"
                                                    className="btn-link"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? <IconEyeClosed size={18} /> : <IconEye size={18} />}
                                                </button>
                                            </span>
                                    </div>
                                    {errors.password && (
                                        <div className="form-hint text-danger">{errors.password.message}</div>
                                    )}
                            </div>

                                    <div className="form-footer">
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
                                            Se connecter
                                        </button>
                                    </div>
                                </form>

                                <div className="hr-text">OU</div>

                                <div className="d-flex justify-content-between gap-3 mt-3">
                                    <a href="#" className="btn btn-outline-google">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-google">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945z"/>
                                        </svg>
                                        Login with Google
                                    </a>
                                    <a href="#" className="btn btn-outline-linkedin  ">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-linkedin">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M8 11v5"/>
                                            <path d="M8 8v.01"/>
                                            <path d="M12 16v-5"/>
                                            <path d="M16 16v-3a2 2 0 1 0 -4 0"/>
                                            <path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z"/>
                                        </svg>
                                        Login with LinkedIn
                                    </a>

                                </div>
                                <div className="text-center mt-3 " >
                                    <p className={"text-muted mb-0"}>Don't have account yet? <a onClick={()=>router.push("/signup")}
                                                                                                style={{cursor:"pointer"}}
                                                                                                className="text-primary fw-bold">Sign up</a></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Illustrateur*/}
                    <div className="col-md-6 text-center mt-4 mt-md-0">
                        <img
                            src="https://tabler.io/_next/image?url=%2Fillustrations%2Flight%2Fmobile-computer.png&w=1632&q=75"
                            alt="Illustration"
                            className="img-fluid"
                            style={{ maxHeight: "500px" }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
