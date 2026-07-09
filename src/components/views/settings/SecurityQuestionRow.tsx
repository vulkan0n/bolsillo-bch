import { useEffect, useState } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";

import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";
import ModalService from "@/kernel/app/ModalService";

import Button from "@/atoms/Button";

import common from "@/translations/common";
import { translate } from "@/util/translations";
import translations from "./translations";
import securityTranslations from "@/views/security/translations";

interface SecurityQuestionRowProps {
  onSetup: () => void;
}

export default function SecurityQuestionRow({
  onSetup,
}: SecurityQuestionRowProps) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(function checkConfiguration() {
    setIsLoading(true);
    SecurityService()
      .hasSecurityQuestion()
      .then(setIsConfigured)
      .finally(() => setIsLoading(false));
  }, []);

  const handleReconfigure = async () => {
    const Security = SecurityService();
    const isAuthorized = await Security.authorize(AuthActions.Any);
    if (!isAuthorized) return;
    onSetup();
  };

  const handleRemove = async () => {
    const Security = SecurityService();
    const isAuthorized = await Security.authorize(AuthActions.Any);
    if (!isAuthorized) return;

    const isConfirmed = await ModalService().showConfirm({
      title: translate(securityTranslations.securityQuestion),
      message: translate(translations.removeSecurityQuestionDescription),
      confirmLabel: translate(translations.remove),
      cancelLabel: translate(common.cancel),
      isDanger: true,
    });
    if (!isConfirmed) return;

    await Security.clearSecurityQuestionData();
    setIsConfigured(false);
  };

  if (isLoading) {
    return (
      <div className="p-2.5">
        <div className="flex items-center">
          <QuestionCircleOutlined className="text-xl mr-1" />
          <span>{translate(securityTranslations.securityQuestion)}</span>
        </div>
      </div>
    );
  }

  const description = isConfigured
    ? translate(translations.securityQuestionConfigured)
    : translate(translations.securityQuestionNotConfigured);

  return (
    <div className="p-2.5">
      <div className="flex items-center">
        <QuestionCircleOutlined className="text-xl mr-1" />
        <span>{translate(securityTranslations.securityQuestion)}</span>
      </div>
      <div className="pt-2 text-sm">{description}</div>
      <div className="pt-2 flex gap-2">
        {isConfigured ? (
          <>
            <Button
              onClick={handleReconfigure}
              label={translate(translations.reconfigure)}
            />
            <Button
              onClick={handleRemove}
              label={translate(translations.remove)}
              bgColor="bg-error/80"
              activeBgColor="bg-error"
              labelColor="text-white"
            />
          </>
        ) : (
          <Button onClick={onSetup} label={translate(translations.setupNow)} />
        )}
      </div>
    </div>
  );
}
