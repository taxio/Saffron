import * as enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';

console.log('setup tests');

enzyme.configure({ adapter: new Adapter() });
