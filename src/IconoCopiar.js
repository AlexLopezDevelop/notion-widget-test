import React from 'react';
import IconoCopiar from './assets/IconoCopiar.png';

const CopyIcon = () => {
    return (
        <img
            src={IconoCopiar}
            alt="Copiar"
            height={15}
            style={{ verticalAlign: 'middle', marginRight: '5px' }}
        />
    );
};

export default CopyIcon;