import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

import { clearSendDraft, selectSendDraft } from "@/redux/sendDraft";

import AppButton from "@/atoms/AppButton";

export default function SendPlaceholder() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const draft = useSelector(selectSendDraft);

  const pretty = draft
    ? `${draft.address?.slice(0, 12)}…${draft.address?.slice(-8)}`
    : "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 gap-6">
      <button
        type="button"
        onClick={() => {
          navigate("/wallet/send/scan");
        }}
        className="absolute top-safe-top left-5 w-10 h-10 flex items-center justify-center"
        aria-label="Volver"
      >
        <ArrowLeft className="w-6 h-6 text-gray-800" />
      </button>

      <h2 className="text-headline font-bold text-center">
        Pantalla en construcción
      </h2>

      {draft && (
        <div className="text-center text-body text-gray-600">
          <p>Dirección: {pretty}</p>
          {draft.amountSats && <p>Monto: {draft.amountSats} sats</p>}
          {draft.memo && <p>Memo: {draft.memo}</p>}
        </div>
      )}

      <AppButton
        variant="secondary"
        size="lg"
        onClick={() => {
          dispatch(clearSendDraft());
          navigate("/wallet");
        }}
      >
        Cancelar envío
      </AppButton>
    </div>
  );
}
