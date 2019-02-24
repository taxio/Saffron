import * as enzyme from 'enzyme';
import * as React from 'react';
import Home from '../Home';

import * as Adapter from 'enzyme-adapter-react-16';

enzyme.configure({ adapter: new Adapter() });

it('render test', () => {
  const rendered = enzyme.shallow(<Home />);
  console.log(rendered.find('button').text());
  expect(true).toEqual(true);
});
