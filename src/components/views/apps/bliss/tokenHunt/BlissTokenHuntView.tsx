import FullColumn from "@/layout/FullColumn";

function BlissTokenHuntView() {
  return (
    <FullColumn>
      <div className="px-2 py-4">
        <h1 className="font-bliss text-2xl text-[#e8078c] bg-[linear-gradient(to_bottom,_rgb(232,_7,_140),_rgb(160,_137,_191))] bg-clip-text text-transparent">
          Token Hunt
        </h1>
        <div>
          There are 10 Token Hunt fungible tokens (plus the special "All Star" token) to collect by completing various challenges at or related to BLISS 2026. Collect a set of 3 or more different tokens & cash them in for an exclusive BLISS prize!
        </div>
        <br />
        <div>
          Tokens may of course be traded, bartered, bought/sold or gifted among attendees (or non-attendees!) as they please. Some tokens are harder to acquire than others - so be savvy!
        </div>

        <br />
        <hr />
        <br />

        <h2 className="font-bliss text-lg">
          Tokens
        </h2>

        <div>#0: All Star!</div>
        <div>Check in at BLISS 2026 with a complete set of BLISS NFTs: A Jessica, Velma & Layla. This special token can substitute for any other token to complete a set.</div>

        <div>#9: Trailblazer</div>
        <div>Each participant in the BLAZE hackathon in November 2025 received a Trailblazer token.</div>

        <br />
        <hr />
        <br />

        <h2 className="font-bliss text-lg">
          Prizes
        </h2>
        <div>
          Cash in a set of 3, 5, 8 or 10 distinct tokens to claim a unique BLISS 2026 prize! Remember: The special "All Star" token can complete a set by substituting for any other token.
        </div>
        <div>
          <h3>3 tokens: Deck of Layla Playing Cards</h3>
          <h3>5 tokens: BLISS 2026 Shirt & Cap</h3>
          <h3>8 tokens: ~</h3>
          <h3>10 tokens: Gold-leaf Edition of Hijacking Bitcoin</h3>
        </div>
      </div>
    </FullColumn >
  );
}

export default BlissTokenHuntView;
