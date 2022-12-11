# react-global-state-management
When you look about global state management system, you will find `DataContext` or even more complex like `Redux`
The problem with those two are 

1- `DataContext` is a global context but for it to be able to work with state you will have to assign it a mutated data and that will cause it to update globaly, which is in many times not nessecry needed, and you cannot controll how it works.

2- `Redux` is just to complex to setup and I would not like working with ever.

So I build I library where you can reach your data globally and also controll to which components and its properties should trigger a rebuild when changing the data.

This library works for all apps that uses react as its base, eg like `react-native` and `reactjs`

## Install
`npm i react-global-state-management`

## Example 
Have a look at [Snack](https://snack.expo.dev/@alentoma/globalstate)

## Usage
```tsx
import GlobalState from 'react-global-state-management';
const data = GlobalState({
  text: 'someText',
  item: { counter: 0, item2: { counter: 0 } },
  arr:[{test: 0}]
});

const TTX = () => {
  // bind mutated to this component 
  // You could also have a global mutation with only "data.hook();"
  // below mean that only when data.item.item2.counter changed, it will trigger rebuild for this component.
  data.hook(x=> [x.item.item2.counter]); 
  return <Text>counterComponentWithHook: {data.item.item2.counter}</Text>;
};

const TTX2 = () => {
  data.subscribe(
    (item, props) => {
      console.log('data.item.counter Changed in TTX2 component', props);
    },
    x => [x.item.counter]
  );
  return <Text>counterComponentWithoutHook: {data.item.counter}</Text>;
};


export default function App() {
  data.subscribe((item, props) => {
    console.log('data Changed in App component', props);
  });
  return (
    <View>
      <Text>
        AppComponentCounter: {data.item.counter}
      </Text>
      <TTX />
      <TTX2 />
      <Button
        title="inc Counter"
        onPress={() => {
          data.item.counter++;
        }}
      />

      <Button
        title="inc counter2"
        onPress={() => {
          data.item.item2.counter++;
        }}
      />

        <Button
        title="inc array"
        onPress={() => {
          data.arr[0].test++;
          data.arr.push({test:5}) // this will also trigger change
        }}
      />
    </View>
  );
}

```

## Properties and events
Rebuild the component when a change happened
```js
hook() OR hook(x=> [x.item.counter,..])
```

`Subscribe` to changes when the global data change. This works like useEffect except You will have more control over you updates and this will not trigger rebuild
```js
// global
data.subscribe(
    (item, props) => {
      console.log('item.item2.counter Changed in TTX2 component');
    }
  ); 
  
  //OR
  
 // Only when item.counter
  data.subscribe(
    (item, props) => {
      console.log('item.item2.counter Changed in TTX2 component');
    },
    x => [x.item.counter,..]
  );  
  
  ```
  
| Name  | Descriptions |
| ------------- | ------------- |
| hook  | event that bind properties to the components so that when changes happend a rebuild happend in component  |
| subscribe  | event work as useeffect without rerendering the component  |
| execludeComponentsFromMutations  | args that is passed to the global data that execlude some properties from herarkie binding|
| disableTimer  | The library create a `settimeout` for each changes so that when two changes happend at the same time only one call will be triggered. You can disable this and trigger a call after each change directly, this is usefull when using it in games.  |
| onChange  | You can use this prop outside components, as `subscribe` and `hooks` can only be used in components  |
| stringify  | This solve the self refrences issue when parsing the object to json string  |
| triggerChange  | Sometimes you are using props in components that do not have `hooks` or `subscribe`, using this method you could trigger updates to those components by specifing 
thair Identifiers  |

