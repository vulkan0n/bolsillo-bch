import { useNavigate } from "react-router-dom";

function ContactPicker() {
  const address = "bitcoincash:qzyw7yz3mpwlujpd3e7f9llw9kk37l53vqrn77mm6d";

  return (
    <div className="px-2 py-2 flex flex-wrap bg-zinc-100 justify-around rounded-lg mx-2">
      <ContactButton name="Kallisti" address={address} />
      <ContactButton name="Jeremy" address={address} />
      <ContactButton name="imaginary_username" address={address} />
      <ContactButton name="emergent_reasons" address={address} />
      <ContactButton name="CheapLightning" address={address} />
      <ContactButton name="bitcoincashautist" address={address} />
      <ContactButton name="2qx" address={address} />
      <ContactButton name="Mathieu G" address={address} />
      <ContactButton name="bitjson" address={address} />
      <ContactButton name="Rowan" address={address} />
      <ContactButton name="Jessquit" address={address} />
      <ContactButton name="Flowee" address={address} />
    </div>
  );
}

export default ContactPicker;

function ContactButton({ name, address }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/wallet/send/${address}`);
  };

  return (
    <div className="flex-1" style={{ minWidth: "33%" }}>
      <button
        type="button"
        className="btn btn-sm btn-ghost p-0 flex-nowrap"
        onClick={handleClick}
      >
        <div className="avatar placeholder">
          <div className="w-7 rounded-full bg-neutral-focus text-neutral-content">
            <span className="text-xs">{name.charAt(0)}</span>
          </div>
        </div>
        <span className="text-xs px-2 -ml-1 border border-1 border-l-0 rounded border-black bg-white text-slate-500">
          {name.split(" ")[0].substring(0, 10)}
        </span>
      </button>
    </div>
  );
}
