""" a linked list data structure is used to define the workflow """

class Node:
    def __init__(self, node_fn, stage):
        self.node_fn = node_fn
        self.stage = stage
        self.next = None

class WorkFlow:
    def __init__(self):
        self.head = None

    def insert(self, node):
        """ this func is used to insert the node """
        if self.head is None:
            self.head = node
            return
        cur_node = self.head
        while cur_node.next:
            cur_node = cur_node.next
        cur_node.next = node

    def __iter__(self):
        cur_node = self.head
        while cur_node:
            yield cur_node
            cur_node = cur_node.next
