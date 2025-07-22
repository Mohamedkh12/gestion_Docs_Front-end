'use client';

import api from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { IconLock, IconMail, IconUser, IconPhone, IconBuilding, IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { SignupFormSchema } from "../../types/auth";
import Link from "next/link";

type SignUpFormData = z.infer<typeof SignupFormSchema>;

export default function SignUpForm() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(SignupFormSchema),
    });

    const onSubmit = async (data: SignUpFormData) => {
        if (!termsAccepted) {
            setSubmitError("Vous devez accepter les conditions d'utilisation");
            return;
        }

        try {
            const response = await api.post('/api/users/register', {
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword
            });
            router.push('/signin');
        } catch (e: any) {
            const msg = e.response?.data?.error || "Une erreur est survenue lors de l'inscription";
            setSubmitError(msg);
        }
    };

    return (
        <div className="container container-tight py-4" style={{ maxWidth: "550px",maxHeight:"700px"}}>
            <div className="card card-md" >
                <div className="text-center mt-5">
                    <h1 className="text-primary">Créer un nouveau compte</h1>
                </div>
                <div className="card-body">
                    {submitError && (
                        <div className="alert alert-danger">{submitError}</div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <fieldset className="form-fieldset" disabled={isSubmitting}>
                            {/* Prénom */}
                            <div className="mb-3">
                                <label className="form-label required">Prénom</label>
                                <div className="input-group input-group-flat">
                                    <span className="input-group-text">
                                        <IconUser size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                                        placeholder="Votre prénom"
                                        {...register('firstname')}
                                    />
                                </div>
                                {errors.firstname && (
                                    <div className="form-hint text-danger">{errors.firstname.message}</div>
                                )}
                            </div>

                            {/* Nom */}
                            <div className="mb-3">
                                <label className="form-label required">Nom</label>
                                <div className="input-group input-group-flat">
                                    <span className="input-group-text">
                                        <IconUser size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                                        placeholder="Votre nom"
                                        {...register('lastname')}
                                    />
                                </div>
                                {errors.lastname && (
                                    <div className="form-hint text-danger">{errors.lastname.message}</div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="mb-3">
                                <label className="form-label required">Email</label>
                                <div className="input-group input-group-flat">
                                    <span className="input-group-text">
                                        <IconMail size={16} />
                                    </span>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        placeholder="votre@email.com"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && (
                                    <div className="form-hint text-danger">{errors.email.message}</div>
                                )}
                            </div>

                            {/* Mot de passe */}
                            <div className="mb-3">
                                <label className="form-label required">Mot de passe</label>
                                <div className="input-group input-group-flat">
                                    <span className="input-group-text">
                                        <IconLock size={16} />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        placeholder="Votre mot de passe"
                                        {...register('password')}
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
                                    <div className="form-hint text-danger">
                                        <ul className="list-unstyled">
                                            {errors.password.message.split(',').map((msg, index) => (
                                                <li key={index}>- {msg.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* confirme Mot de passe */}
                            <div className="mb-3">
                                <label className="form-label required">Confirme mot de passe</label>
                                <div className="input-group input-group-flat">
                                    <span className="input-group-text">
                                        <IconLock size={16} />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${errors.confirmPassword  ? 'is-invalid' : ''}`}
                                        placeholder="Votre mot de passe"
                                        {...register('confirmPassword')}
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
                                {errors.confirmPassword  && (
                                    <div className="form-hint text-danger">
                                        <ul className="list-unstyled">
                                            {errors.confirmPassword .message.split(',').map((msg, index) => (
                                                <li key={index}>- {msg.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Conditions */}
                            <label className="form-check mt-4">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                                <span className="form-check-label required">
                                    J'accepte les conditions générales d'utilisation
                                </span>
                            </label>

                            {/* Bouton de soumission */}
                            <div className="form-footer mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Inscription en cours...
                                        </>
                                    ) : (
                                        "S'inscrire"
                                    )}
                                </button>
                            </div>
                        </fieldset>
                    </form>

                    {/* Lien vers la page de connexion */}
                    <div className="text-center text-muted mt-3">
                        Already have an account?{' '}
                        <Link href="/signin" className="text-primary">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
