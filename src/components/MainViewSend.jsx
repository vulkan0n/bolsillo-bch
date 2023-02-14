/* = MainView Send Tab =
 * send screen:
 *  1. enter address
 *  2. scan QR from image
 *  3. contact list/recent addresses/transaction log
 */

function MainViewSend() {
  return (
    <div>
      <div><input type="text" placeholder="Enter BCH Address" /></div>
      <div>
        <ul>
          <li>Contact One</li>
          <li>Contact Two</li>
          <li>Contact Three</li>
          <li>Contact Four</li>
          <li>Contact Five</li>
        </ul>
      </div>
    </div>
  );
}

export default MainViewSend;
