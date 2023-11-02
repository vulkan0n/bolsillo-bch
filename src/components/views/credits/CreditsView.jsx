import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ViewHeader from "@/layout/ViewHeader";
import SeleneLogo from "@/components/atoms/SeleneLogo";
import { SELENE_WALLET_VERSION } from "@/util/version";
import { translate } from "@/util/translations";
import translations from "./CreditsViewTranslations";

export default function CreditsView() {
  const navigate = useNavigate();
  const [debugTaps, setDebugTaps] = useState(0);

  const handleDebugTap = () => {
    setDebugTaps((taps) => taps + 1);
    if (debugTaps >= 6) {
      navigate("/debug");
    } else {
      setTimeout(() => setDebugTaps((taps) => taps - 1), 1337);
    }
  };

  return (
    <>
      <ViewHeader icon={() => null} title={translate(translations.credits)} />
      <div className="bg-primary text-white text-center p-2">
        <div className="flex items-center justify-center h-40">
          <SeleneLogo className="h-full" onClick={handleDebugTap} />
        </div>
        <h1 className="text-2xl font-bold">
          Selene Wallet v{SELENE_WALLET_VERSION}
        </h1>
        <h2 className="text-xl font-bold">
          {translate(translations.developedWith)}
        </h2>
        <h2 className="text-xl font-semibold p-1">
          {translate(translations.contributors)}
        </h2>
      </div>
      <div className="p-2 w-5/6 mx-auto">
        <h2 className="text-center font-bold text-2xl">
          {translate(translations.flipstarterContributors)}
        </h2>
        <ol className="list-inside list-decimal">
          <li>majamalu</li>
          <li>toorik</li>
          <li>&quot;Satoshi Nakamoto&quot;</li>
          <li>ErdoganTalk</li>
          <li>Mike Komaransky</li>
          <li>Anonymous</li>
          <li>&quot;Philip J Fry&quot;</li>
          <li>Cheapy</li>
          <li>Jett</li>
          <li>imaginary_username</li>
          <li>fshinetop</li>
          <li>emergent_reasons</li>
          <li>2qx</li>
          <li>Bernanácatl</li>
          <li>pat</li>
          <li>Yasin</li>
          <li>&quot;ChatGPT&quot;</li>
          <li>Bitcoin Out Loud</li>
          <li>zmach1n3</li>
          <li>Omar</li>
          <li>Max Hastings</li>
          <li>sandakersmann</li>
          <li>Sydwell</li>
          <li>Steve2048</li>
          <li>Gustavo</li>
          <li>Coins4Clothes</li>
          <li>Remora_101</li>
          <li>PanteraBCH</li>
          <li>Anonymous (x5)</li>
        </ol>

        <h2 className="text-center font-bold text-2xl mt-4">
          {translate(translations.translators)}
        </h2>
        <ul className="list-inside list-disc">
          <li>Marius Kjærstad (GitLab: @sandakersmann)</li>
          <li>Prashant Singh Pawar (GitLab: @prashantpawar)</li>
        </ul>

        <h2 className="text-center font-bold text-2xl mt-4">
          {translate(translations.specialThanks)}
        </h2>
        <ul className="list-inside list-disc">
          <li>Jason Dreyzehner</li>
          <li>vvn</li>
          <li>Lisa L</li>
          <li>NeonDaThal</li>
          <li>Johnathan Silverblood</li>
          <li>Mathieu Geukens</li>
          <li>Jim Hamill</li>
          <li>Bitcoin Jason</li>
          <li>Sahid Miller</li>
          <li>Ian Blas</li>
          <li>@CM_Works</li>
          <li>Arthur</li>
          <li>Gustavo</li>
        </ul>
      </div>
    </>
  );
}
