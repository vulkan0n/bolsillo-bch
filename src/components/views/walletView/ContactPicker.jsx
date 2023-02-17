import { useNavigate } from "react-router-dom";

function ContactPicker() {
  const navigate = useNavigate();

  const address = "bitcoincash:qzyw7yz3mpwlujpd3e7f9llw9kk37l53vqrn77mm6d";

  const handleSelectContact = () => {
    navigate(`/wallet/send/${address}`);
  };

  return (
    <div className="px-2 py-2 flex flex-wrap bg-gray-200 justify-around">
      <ContactButton name="Kallisti" onClick={handleSelectContact} />
      <ContactButton name="Jeremy" onClick={handleSelectContact} />
      <ContactButton name="imaginary_username" onClick={handleSelectContact} />
      <ContactButton name="emergent_reasons" onClick={handleSelectContact} />
      <ContactButton name="CheapLightning" onClick={handleSelectContact} />
      <ContactButton name="bitcoincashautist" onClick={handleSelectContact} />
      <ContactButton name="2qx" onClick={handleSelectContact} />
      <ContactButton name="Mathieu G" onClick={handleSelectContact} />
      <ContactButton name="Mathieu G" onClick={handleSelectContact} />
      <ContactButton name="Kallisti" onClick={handleSelectContact} />
      <ContactButton name="Jeremy" onClick={handleSelectContact} />
      <ContactButton name="imaginary_username" onClick={handleSelectContact} />
      <ContactButton name="emergent_reasons" onClick={handleSelectContact} />
      <ContactButton name="CheapLightning" onClick={handleSelectContact} />
      <ContactButton name="bitcoincashautist" onClick={handleSelectContact} />
      <ContactButton name="2qx" onClick={handleSelectContact} />
      <ContactButton name="Mathieu G" onClick={handleSelectContact} />
      <ContactButton name="Mathieu G" onClick={handleSelectContact} />
    </div>
  );
}

export default ContactPicker;

function ContactButton({ name, onClick }) {
  return (
    <div className="flex-1" style={{minWidth: "33%"}}>
      <button type="button" className="btn btn-sm btn-ghost p-0 flex-nowrap" onClick={onClick}>
        <div className="avatar placeholder">
          <div className="w-7 rounded-full bg-neutral-focus text-neutral-content">
            <span className="text-xs">{name.charAt(0)}</span>
          </div>
        </div>
        <span className="text-xs px-2 -ml-1 border border-1 border-l-0 rounded border-black bg-zinc-100 text-slate-500">
          {(name.split(" ")[0]).substring(0, 11)}
        </span>
      </button>
    </div>
  );
}
