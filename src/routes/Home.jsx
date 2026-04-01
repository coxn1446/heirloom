import React, { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { UsernameSignInModal } from '../components/Auth/UsernameSignInModal';
import cameraImage from '../resources/camera.png';
import sharingImage from '../resources/sharing.png';
import storyImage from '../resources/story.png';
import { setAuthFromMock } from '../store/auth.reducer';
import { loginWithUsername } from '../helpers/authHelpers';

export default function Home() {
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDesktopLayout, setIsDesktopLayout] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : false));
  const dispatch = useDispatch();
  const logoSrc = `${process.env.PUBLIC_URL || ''}/heirloom-logo.png`;
  const howItWorksSteps = [
    {
      key: 'camera',
      imageSrc: cameraImage,
      imageAlt: 'Camera and keepsakes',
      title: 'Capture the object',
    },
    {
      key: 'story',
      imageSrc: storyImage,
      imageAlt: 'Open storybook',
      title: 'Save the story',
    },
    {
      key: 'sharing',
      imageSrc: sharingImage,
      imageAlt: 'Family photo sharing',
      title: 'Share by family',
    },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsDesktopLayout(window.innerWidth >= 1024);
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      toast.error('Enter a username to continue');
      return;
    }

    const res = await loginWithUsername(trimmedUsername);
    if (!res.ok) {
      toast.error(res.body?.error || 'Login failed');
      return;
    }

    dispatch(
      setAuthFromMock({
        user: res.body.user,
        isProfileComplete: res.body.isProfileComplete,
      })
    );

    setIsModalOpen(false);
    toast.success(`Welcome, ${res.body.user.username}`);
  }

  return (
    <IonPage>
      <IonContent fullscreen="true" className="bg-heirloom-beige">
        <div className="shell-page">
          <div className="shell-container flex min-h-screen flex-col py-4 sm:py-6 lg:py-8">
            {!isDesktopLayout ? (
              <header className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={logoSrc} alt="Heirloom" className="h-12 w-auto sm:h-14" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-heirloom-earthy/60">Family archive</p>
                    <h1 className="text-3xl font-semibold tracking-tight text-heirloom-tomato sm:text-4xl">Heirloom</h1>
                  </div>
                </div>
                <button type="button" onClick={() => setIsModalOpen(true)} className="heirloom-button">
                  Sign In
                </button>
              </header>
            ) : null}

            <main className="flex flex-1 flex-col justify-between gap-6 py-6 lg:gap-8 lg:pt-0 lg:pb-10">
              {isDesktopLayout ? (
                <>
                  <section className="hidden min-h-0 lg:grid lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.9fr)] lg:items-start lg:gap-8">
                    <div className="flex flex-col">
                      <div className="rounded-[1.75rem] border border-transparent p-6 shadow-[0_18px_60px_rgba(78,124,90,0)]">
                        <div className="flex items-center gap-3">
                          <img src={logoSrc} alt="Heirloom" className="h-14 w-auto" />
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-heirloom-earthy/60">Family archive</p>
                            <h1 className="text-4xl font-semibold tracking-tight text-heirloom-tomato">Heirloom</h1>
                          </div>
                        </div>
                        <div className="mt-6">
                          <p className="text-xs uppercase tracking-[0.24em] text-heirloom-earthy/60">Preserve what matters</p>
                          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-heirloom-earthy xl:text-5xl">
                            Keep family objects and their stories together.
                          </h2>
                          <p className="mt-4 max-w-2xl text-base leading-7 text-heirloom-earthy/80 xl:text-lg">
                            Capture heirlooms, record where they came from, and share them only with the families who should see them.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="heirloom-panel flex h-full flex-col justify-between gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-heirloom-earthy/60">Enter the archive</p>
                        <h2 className="mt-3 text-3xl font-semibold text-heirloom-earthy">Sign in with any username</h2>
                        <p className="mt-3 text-sm leading-6 text-heirloom-earthy/80">
                          This mock shell creates a username-only mock account in the browser so you can explore the catalog flow without passwords.
                        </p>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <label htmlFor="desktop-username" className="block text-sm font-medium text-heirloom-earthy">
                          Username
                        </label>
                        <input
                          id="desktop-username"
                          name="username"
                          type="text"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          autoComplete="username"
                          placeholder="e.g. william"
                          className="heirloom-input"
                        />
                        <button type="submit" className="heirloom-button w-full">
                          Login
                        </button>
                      </form>
                    </div>
                  </section>

                  <section className="hidden lg:grid lg:flex-1 lg:grid-cols-3 lg:items-stretch lg:gap-4">
                    <article className="heirloom-panel">
                      <p className="text-xs uppercase tracking-[0.24em] text-heirloom-earthy/60">Catalog</p>
                      <div className="mt-4 flex h-28 items-center justify-center rounded-3xl bg-heirloom-beige/50 p-3">
                        <img src={cameraImage} alt="Camera and keepsakes" className="h-full w-full object-contain" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-heirloom-earthy">Capture objects</h3>
                      <p className="mt-2 text-sm leading-6 text-heirloom-earthy/80">
                        Photograph objects, record provenance, and keep descriptions, dates, and ownership history together.
                      </p>
                    </article>
                    <article className="heirloom-panel">
                      <p className="text-xs uppercase tracking-[0.24em] text-heirloom-earthy/60">Preserve</p>
                      <div className="mt-4 flex h-28 items-center justify-center rounded-3xl bg-heirloom-beige/50 p-3">
                        <img src={storyImage} alt="Open storybook" className="h-full w-full object-contain" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-heirloom-earthy">Keep the story</h3>
                      <p className="mt-2 text-sm leading-6 text-heirloom-earthy/80">
                        Save the details behind a bag, letter, ring, or piece of silver before memory and context fade.
                      </p>
                    </article>
                    <article className="heirloom-panel">
                      <p className="text-xs uppercase tracking-[0.24em] text-heirloom-earthy/60">Share</p>
                      <div className="mt-4 flex h-28 items-center justify-center rounded-3xl bg-heirloom-beige/50 p-3">
                        <img src={sharingImage} alt="Family photo sharing" className="h-full w-full object-contain" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-heirloom-earthy">Share by family</h3>
                      <p className="mt-2 text-sm leading-6 text-heirloom-earthy/80">
                        People can belong to multiple families, and only the families tagged on an item can view it.
                      </p>
                    </article>
                  </section>
                </>
              ) : (
                <section className="flex flex-col justify-center gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-heirloom-earthy/60">Preserve what matters</p>
                    <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-heirloom-earthy sm:text-5xl">
                      Keep family objects and their stories together.
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-heirloom-earthy/80 sm:text-lg">
                      Capture heirlooms, record where they came from, and share them only with the families who should see them.
                    </p>
                  </div>

                  <div className="heirloom-panel p-5 lg:hidden">
                    <p className="text-xs uppercase tracking-[0.24em] text-heirloom-earthy/60">How it works</p>
                    <div
                      data-testid="mobile-how-it-works-carousel"
                      aria-label="How it works carousel"
                      className="shell-story-carousel mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-1 pr-6"
                    >
                      {howItWorksSteps.map((step) => (
                        <article
                          key={step.key}
                          className="w-4/5 shrink-0 snap-center rounded-3xl border border-heirloom-earthy/10 bg-white p-4 shadow-sm sm:w-3/5"
                        >
                          <div className="flex h-28 items-center justify-center rounded-[1.5rem] bg-heirloom-beige/50 p-3 sm:h-32">
                            <img src={step.imageSrc} alt={step.imageAlt} className="h-full w-full object-contain" />
                          </div>
                          <h3 className="mt-4 text-center text-base font-semibold text-heirloom-earthy sm:text-lg">{step.title}</h3>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </main>
          </div>
          {!isDesktopLayout ? (
            <UsernameSignInModal
              isOpen={isModalOpen}
              username={username}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleSubmit}
              onUsernameChange={setUsername}
            />
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
}
