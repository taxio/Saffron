import * as React from 'react';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: React.SFC<PopUpProps> = props => (
  <div
    style={{
      position: 'fixed',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      top: 0,
      left: 0,
    }}
  >
    <div
      style={{
        position: 'fixed',
        width: '50%',
        height: '50%',
        backgroundColor: 'white',
      }}
    >
      <button onClick={props.onClose}>Close</button>
    </div>
  </div>
);

export default PopUp;
