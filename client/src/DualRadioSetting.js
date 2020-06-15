import React, { Component } from 'react';

const DualRadioSetting = ({name, isOptionEnabled, onChange, trueOptionText, falseOptionText}) => (
  <span>
    <label>
      <input
        type="radio"
        name={name}
        value={true}
        checked={isOptionEnabled}
        onChange={onChange}
      />
      {trueOptionText}
    </label>
    <label>
      <input
        type="radio"
        name={name}
        value={false}
        checked={!isOptionEnabled}
        onChange={onChange}
      />
      {falseOptionText}
    </label>
  </span>
);

export default DualRadioSetting;
