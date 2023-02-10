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
  data.hook("item.item2.counter"); 
  return <Text>counterComponentWithHook: {data.item.item2.counter}</Text>;
};

const TTX2 = () => {
  data.subscribe(
    (item, props) => {
      console.log('data.item.counter Changed in TTX2 component', props);
    },
    "item.counter"
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
hook() OR hook("item.counter", ...)
```
Rebuild the component with conditions
```js
on<boolean>("item.enabled", (value)=> value === true)
```


`Subscribe` to changes when the global data change. This works like useEffect except You will have more control over your updates and this will not trigger rebuild
```js
// global
data.subscribe(
    (item, props) => {
      console.log('GlobalState Changed');
    }
  ); 
  
  //OR
  
 // Only when item.counter
  data.subscribe(
    (item, props) => {
      console.log('item.item2.counter Changed in TTX2 component');
    },
    "item.counter",...
  );  
  
  ```
  
| Name  | Descriptions |
| ------------- | ------------- |
| hook  | event that bind properties to the components so that when changes happend a rebuild happend in component  |
| subscribe  | event work as useeffect without rerendering the component  |
| on  | create a hook that trigger rebuild on conditions that you specify |
| execludeComponentsFromMutations  | args that is passed to the global data that execlude some properties from herarkie binding(the library create `set` and `get` for each property. And this is done herarkie. You can execlude objects from this. eg objects and not (number, boolean,string) propeties)|
| disableTimer  | The library create a `settimeout` for each changes so that when two changes happend at the same time only one call will be triggered. You can disable this and trigger a call after each change directly, this is usefull when using it in games.  |
| onChange  | You can use this prop outside components, as `subscribe` and `hooks` can only be used in components  |
| stringify  | This solve the self refrences issue when parsing the object to json string  |
| triggerChange  | Sometimes you are using props in components that do not have `hooks` or `subscribe`, using this method you could trigger updates to those components by specifing thair Identifiers|

## Exelude objects in array
Typescript will complain when you add a path that is contained in array, as `execludeComponentsFromMutations` only take object path in its array.
To solve this issue, you are able to assign a method to `execludeComponentsFromMutations` that return `true` if it execluded and `false` if not
```js
  const data = GlobalState({
  text: 'someText',
  item: { counter: 0, item2: { counter: 0 } },
  arr:[{test: 0, item: {text:""}}]
}, (path)=> {
  if (path === "arr.item")
      return true; // execlude `arr.item` from mutation
    return false;
});

```
