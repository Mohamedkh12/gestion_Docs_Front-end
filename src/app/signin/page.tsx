import SignInForm from '../components/auth/SignInForm';

export const metadata={
    title:"Connexion",
}

export default function SignInPage(){
    return (
        <>
            <div className="page page-center">
                <SignInForm />
            </div>
        </>
    )
}
