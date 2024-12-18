import Image from "next/image";
import Link from "next/link";

import { providerMap, signIn } from "@icebreaker/auth";
import { Button } from "@icebreaker/ui/button";
import { ArrowUpRight, ChevronRight } from "@icebreaker/ui/icons";

const SignInPage = async (props: {
  searchParams: Promise<{ callbackUrl: string | undefined }>;
}) => {
  const searchParams = await props.searchParams;

  return (
    <div>
      <div className="fixed inset-0 -z-10">
        <Image
          src={"/karim-manjra-CqXoj3mSAak-unsplash.jpg"}
          alt="a bunch of mops"
          className="object-cover brightness-[25%] saturate-[50%]"
          layout="fill"
        />
        <div className="background-noise absolute inset-0 z-50" />
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-bl from-white to-transparent dark:from-black"></div>
      </div>
      <div className="container flex h-svh flex-col justify-between px-8 py-[min(12vw,12rem)]">
        <div className="w-min">
          <p className="max-w-full pr-4 text-4xl font-thin leading-normal sm:text-5xl md:text-7xl">
            schrubben
          </p>
          <p className="text-right text-xs opacity-75 md:text-base">— Micha</p>
        </div>
        <div className="flex flex-wrap-reverse justify-between gap-x-32 gap-y-8">
          <p className="self-end text-xs text-white opacity-50 dark:text-white">
            image by{" "}
            <Link
              href="https://unsplash.com/photos/red-and-orange-push-boroom-leaned-on-blue-door-CqXoj3mSAak"
              className="z-50 decoration-secondary-foreground underline-offset-4 hover:underline"
            >
              karim manjra{" "}
              <ArrowUpRight className="inline-block size-[1.65cap]" />
            </Link>
          </p>
          <div className="self-end">
            {Object.values(providerMap).map((provider) => (
              <form
                key={provider.id}
                action={async () => {
                  "use server";

                  await signIn(provider.id, {
                    redirectTo: searchParams.callbackUrl ?? "",
                  });
                }}
              >
                <Button type="submit" variant={"outline"} size={"lg"}>
                  <span>sign in</span> <ChevronRight />
                </Button>
              </form>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
