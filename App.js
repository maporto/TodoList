import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  FlatList,
  Keyboard,
  TextInput,
  Platform,
  TouchableHighlight,
  AsyncStorage,
  ListView,
  Alert,
} from "react-native";

import {
  CheckBox,
  List,
  ListItem,
  FormLabel,
  FormInput,
} from 'react-native-elements';

import Storage from 'react-native-storage';

import Icon from 'react-native-vector-icons/FontAwesome';

var storage = new Storage({
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: true,
  sync : { }
})

const isAndroid = Platform.OS == "android";
const viewPadding = 10;

export default class TodoList extends Component {
  state = {
    tarefas: [],
    text: ""
  };

  getAll = (callback) => {
    storage.load({
      key: 'TODO',
      autoSync: true,
      syncInBackground: true,
      syncParams: {
        extraFetchOptions: {},
        someFlag: true,
      },
    }).then(callback);
  }

  saveAll = (itens) => {
    storage.save({
      key: 'TODO',
      data: itens,
      expires: null
    });
  }

  changeTextHandler = text => {
    this.setState({ text: text });
  };

  addTarefa = () => {
    this.setState(
      prevState => {
        let { tarefas, text } = prevState;
        return {
          tarefas: tarefas.concat({ key: tarefas.length, text: text, checked: false }),
          text: ""
        };
      },
      () => this.saveAll(this.state.tarefas)
    );
  };

  deleteTarefa = i => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar o Todo?',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'OK', onPress: () => 
          this.setState(
            prevState => {
              let tarefas = prevState.tarefas.slice();

              tarefas.splice(i, 1);

              return { tarefas: tarefas };
            },
            () => this.saveAll(this.state.tarefas)
          )
        },
      ],
      { cancelable: true }
    );
  };

  checkTarefa = i => {
    this.setState(
      prevState => {
        let tarefas = prevState.tarefas;

        tarefas[i].checked = !tarefas[i].checked;

        return { tarefas: tarefas };
      },
      () => this.saveAll(this.state.tarefas)
    );
  };

  componentDidMount() {
    Keyboard.addListener(
      isAndroid ? "keyboardDidShow" : "keyboardWillShow",
      e => this.setState({ viewPadding: e.endCoordinates.height + viewPadding })
    );

    Keyboard.addListener(
      isAndroid ? "keyboardDidHide" : "keyboardWillHide",
      () => this.setState({ viewPadding: viewPadding })
    );

    this.getAll(tarefas => this.setState({ tarefas: tarefas || [] }));
  }

  render() {
    return (
      <ScrollView>
        <FormLabel>Nome da Tarefa</FormLabel>
        <FormInput 
          onChangeText={this.changeTextHandler}
          onSubmitEditing={this.addTarefa}
          placeholder="Digite a descrição tarefa"
          value={this.state.text}
          returnKeyType="done"
          returnKeyLabel="done"
        />
        <List>
          {
            this.state.tarefas.map((item, i) => (
              <CheckBox
                title={item.text}
                iconLeft
                iconType='font-awesome'
                uncheckedIcon='circle-o'
                checkedIcon='check-circle'
                checkedColor='green'
                checked={item.checked}
                onPress={() => this.checkTarefa(i)}
                onLongPress={() => this.deleteTarefa(i)}
              />
            ))
          }
        </List>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    padding: viewPadding,
    paddingTop: 20
  },
  list: {
    width: "100%"
  },
  icon: {
    fontSize: 25
  },
  listItem: {
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: 18
  },
  hr: {
    height: 1,
    backgroundColor: "gray"
  },
  listItemCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5
  },
  textInput: {
    height: 40,
    paddingRight: 10,
    paddingLeft: 10,
    borderColor: "gray",
    borderWidth: isAndroid ? 0 : 1,
    width: "100%"
  }
});